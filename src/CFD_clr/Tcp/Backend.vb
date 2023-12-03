﻿Imports System.Drawing
Imports System.IO
Imports System.Runtime.CompilerServices
Imports CFD
Imports CFD.Storage
Imports Microsoft.VisualBasic.ComponentModel
Imports Microsoft.VisualBasic.Data.IO
Imports Microsoft.VisualBasic.Net.HTTP
Imports Microsoft.VisualBasic.Net.Protocols.Reflection
Imports Microsoft.VisualBasic.Net.Tcp
Imports Microsoft.VisualBasic.Parallel

<Protocol(GetType(Protocols))>
Public Class Backend : Implements ITaskDriver, IDisposable

    ReadOnly socket As TcpServicesSocket

    Public ReadOnly Property TcpPort As Integer
        Get
            Return socket.LocalPort
        End Get
    End Property

    Dim disposedValue As Boolean
    Dim session As Session

    ''' <summary>
    ''' create background server and bind to the tcp port
    ''' </summary>
    ''' <param name="debugPort"></param>
    Sub New(Optional debugPort As Integer? = Nothing)
        Dim port As Integer = If(debugPort Is Nothing, GetFirstAvailablePort(), debugPort)

        Me.socket = New TcpServicesSocket(port, debug:=Not debugPort Is Nothing)
        Me.socket.ResponseHandler = AddressOf New ProtocolHandler(Me, debug:=Not debugPort Is Nothing).HandleRequest
    End Sub

    <MethodImpl(MethodImplOptions.AggressiveInlining)>
    Public Function Run() As Integer Implements ITaskDriver.Run
        Return socket.Run
    End Function

    <Protocol(Protocols.RequestFrame)>
    Public Function RequestFrame(request As RequestStream, remoteAddress As System.Net.IPEndPoint) As BufferPipe
        Dim frameType As FrameTypes = BitConverter.ToInt32(request.ChunkBuffer)
        Dim frameData As Double()() = {}
        Dim reader As New DataAdapter(session)

        Select Case frameType
            Case FrameTypes.Density : frameData = reader.GetDensity
            Case FrameTypes.Speed : frameData = reader.GetSpeed
            Case FrameTypes.XVel : frameData = reader.GetXVel
            Case FrameTypes.YVel : frameData = reader.GetYVel
        End Select

        Dim ms As New MemoryStream
        Dim wr As New BinaryDataWriter(ms) With {.ByteOrder = ByteOrder.LittleEndian}

        For Each row As Double() In frameData
            Call wr.Write(row)
        Next

        Call wr.Flush()

        Return New DataPipe(ms)
    End Function

    <Protocol(Protocols.RequestPoint)>
    Public Function RequestPoint(request As RequestStream, remoteAddress As System.Net.IPEndPoint) As BufferPipe
        Dim par As PointRequestParameters = request.LoadObject(Of PointRequestParameters)
        Dim reader As New DataAdapter(session)
        Dim val As Double = Double.NegativeInfinity

        Select Case par.frame
            Case FrameTypes.Density : val = reader.GetDensity(par.GetPoint)
            Case FrameTypes.Speed : val = reader.GetSpeed(par.GetPoint)
            Case FrameTypes.XVel : val = reader.GetXVel(par.GetPoint)
            Case FrameTypes.YVel : val = reader.GetYVel(par.GetPoint)
        End Select

        Return New DataPipe(BitConverter.GetBytes(val))
    End Function

    <Protocol(Protocols.MoveTracers)>
    Public Function MoveTracers(request As RequestStream, remoteAddress As System.Net.IPEndPoint) As BufferPipe
        Dim speed As Double = BitConverter.ToDouble(request.ChunkBuffer)
        Dim tracers As PointF() = New DataAdapter(session).CFD.moveTracers(factor:=speed).ToArray
        Dim ms As New MemoryStream
        Dim wr As New BinaryDataWriter(ms) With {.ByteOrder = ByteOrder.LittleEndian}

        Call wr.Write(tracers.Length)

        For Each pt As PointF In tracers
            Call wr.Write(New Single() {pt.X, pt.Y})
        Next

        Call wr.Flush()

        Return New DataPipe(ms)
    End Function

    <Protocol(Protocols.Setup)>
    Public Function Setup(request As RequestStream, remoteAddress As System.Net.IPEndPoint) As BufferPipe
        Dim args As SetupParameters = request.LoadObject(Of SetupParameters)
        Dim save As New FrameWriter(args.storagefile.Open(FileMode.OpenOrCreate, doClear:=True, [readOnly]:=False))

        session = New Session(save)
        session.dims(New Size(args.dims(0), args.dims(1))) _
            .interval(args.interval) _
            .iterations(args.max_time)

        Return New DataPipe(CFDTcpProtocols.ok)
    End Function

    <Protocol(Protocols.Start)>
    Public Function Start(request As RequestStream, remoteAddress As System.Net.IPEndPoint) As BufferPipe
        If session Is Nothing Then
            Return New DataPipe(NetResponse.RFC_FAILED_DEPENDENCY)
        ElseIf session.IsPaused Then
            Call session.Resume()
            Return New DataPipe(CFDTcpProtocols.ok)
        Else
            Call session.Run()
            Return New DataPipe(CFDTcpProtocols.ok)
        End If
    End Function

    <Protocol(Protocols.Pause)>
    Public Function Pause(request As RequestStream, remoteAddress As System.Net.IPEndPoint) As BufferPipe
        If session Is Nothing Then
            Return New DataPipe(NetResponse.RFC_FAILED_DEPENDENCY)
        Else
            Call session.Stop()
            Return New DataPipe(CFDTcpProtocols.ok)
        End If
    End Function

    <Protocol(Protocols.[Stop])>
    Public Function [Stop](request As RequestStream, remoteAddress As System.Net.IPEndPoint) As BufferPipe
        If session Is Nothing Then
            Return New DataPipe(NetResponse.RFC_FAILED_DEPENDENCY)
        Else
            Call session.Stop()
            Call session.Dispose()
            Return New DataPipe(CFDTcpProtocols.ok)
        End If
    End Function

    Protected Overridable Sub Dispose(disposing As Boolean)
        If Not disposedValue Then
            If disposing Then
                ' TODO: 释放托管状态(托管对象)
                Call socket.Dispose()
                Call session.Dispose()
            End If

            ' TODO: 释放未托管的资源(未托管的对象)并重写终结器
            ' TODO: 将大型字段设置为 null
            disposedValue = True
        End If
    End Sub

    ' ' TODO: 仅当“Dispose(disposing As Boolean)”拥有用于释放未托管资源的代码时才替代终结器
    ' Protected Overrides Sub Finalize()
    '     ' 不要更改此代码。请将清理代码放入“Dispose(disposing As Boolean)”方法中
    '     Dispose(disposing:=False)
    '     MyBase.Finalize()
    ' End Sub

    Public Sub Dispose() Implements IDisposable.Dispose
        ' 不要更改此代码。请将清理代码放入“Dispose(disposing As Boolean)”方法中
        Dispose(disposing:=True)
        GC.SuppressFinalize(Me)
    End Sub
End Class