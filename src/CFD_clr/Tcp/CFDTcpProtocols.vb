Imports System.Drawing
Imports CFD
Imports Microsoft.VisualBasic.Data.IO
Imports Microsoft.VisualBasic.Net
Imports Microsoft.VisualBasic.Net.HTTP
Imports Microsoft.VisualBasic.Net.Protocols.Reflection
Imports Microsoft.VisualBasic.Net.Tcp
Imports Microsoft.VisualBasic.Parallel
Imports Microsoft.VisualBasic.Serialization.JSON

Public Class CFDTcpProtocols

    Public ReadOnly lpProtocol As Long = New ProtocolAttribute(GetType(Protocols)).EntryPoint

    Public Const ok As String = "ok!"

    Public ReadOnly Property EndPoint As IPEndPoint
    Public ReadOnly Property pars As SetupParameters

    Public ReadOnly Property ready As Boolean
        Get
            Return pars IsNot Nothing AndAlso session_started
        End Get
    End Property

    Dim session_started As Boolean

    Sub New(server As IPEndPoint)
        Me.EndPoint = server
    End Sub

    Public Function config(pars As SetupParameters) As Boolean
        Dim req As New RequestStream(lpProtocol, Protocols.Setup, pars.GetJson)
        Dim data = requestData(req)

        _pars = pars

        If data.GetUTF8String = ok Then
            Return True
        Else
            Return False
        End If
    End Function

    Private Function requestData(req As RequestStream) As RequestStream
        Return New TcpRequest(EndPoint).SendMessage(req)
    End Function

    Public Function getFrameData(type As FrameTypes) As Double()()
        Dim req As New RequestStream(lpProtocol, Protocols.RequestFrame, BitConverter.GetBytes(CInt(type)))
        Dim data = requestData(req)

        If data.Protocol <> HTTP_RFC.RFC_OK AndAlso data.Protocol <> 0 Then
            Return Nothing
        End If

        Dim dims As New Size(pars.dims(0), pars.dims(1))
        Dim frame As Double()() = New Double(dims.Width - 1)() {}
        Dim rd As New BinaryDataReader(data) With {.ByteOrder = ByteOrder.LittleEndian}

        For i As Integer = 0 To frame.Length - 1
            frame(i) = rd.ReadDoubles(dims.Height)
        Next

        Return frame
    End Function

    Public Function start() As Boolean
        Dim req As New RequestStream(lpProtocol, Protocols.Start)
        Dim data = requestData(req)

        session_started = data.GetUTF8String = ok

        If session_started Then
            Return True
        Else
            Return False
        End If
    End Function

    Public Function pause() As Boolean
        Dim req As New RequestStream(lpProtocol, Protocols.Pause)
        Dim data = requestData(req)

        If data.GetUTF8String = ok Then
            Return True
        Else
            Return False
        End If
    End Function

    Public Function [stop]() As Boolean
        Dim req As New RequestStream(lpProtocol, Protocols.Stop)
        Dim data = requestData(req)

        If data.GetUTF8String = ok Then
            Return True
        Else
            Return False
        End If
    End Function

    Public Function [resume]() As Boolean
        Dim req As New RequestStream(lpProtocol, Protocols.Start)
        Dim data = requestData(req)

        If data.GetUTF8String = ok Then
            Return True
        Else
            Return False
        End If
    End Function

    Public Function reset() As Boolean
        Dim req As New RequestStream(lpProtocol, Protocols.Reset)
        Dim data = requestData(req)

        If data.GetUTF8String = ok Then
            Return True
        Else
            Return False
        End If
    End Function

    Public Iterator Function moveTracers(tracerSpeedLevel As Double) As IEnumerable(Of PointF)
        Dim req As New RequestStream(lpProtocol, Protocols.MoveTracers, BitConverter.GetBytes(tracerSpeedLevel))
        Dim data = requestData(req)
        Dim rd As New BinaryDataReader(data) With {.ByteOrder = ByteOrder.LittleEndian}
        Dim n As Integer = rd.ReadInt32
        Dim xy As Single()

        For i As Integer = 0 To n - 1
            xy = rd.ReadSingles(2)
            Yield New PointF(xy(0), xy(1))
        Next
    End Function

    Public Function GetSpeed(xy As Point) As Double
        Dim pars As New PointRequestParameters With {.x = xy.X, .y = xy.Y, .frame = FrameTypes.Speed}
        Dim req As New RequestStream(lpProtocol, Protocols.RequestPoint, pars.GetJson)
        Dim data = requestData(req)

        Return BitConverter.ToDouble(data.ChunkBuffer)
    End Function

    Public Function GetDensity(xy As Point) As Double
        Dim pars As New PointRequestParameters With {.x = xy.X, .y = xy.Y, .frame = FrameTypes.Density}
        Dim req As New RequestStream(lpProtocol, Protocols.RequestPoint, pars.GetJson)
        Dim data = requestData(req)

        Return BitConverter.ToDouble(data.ChunkBuffer)
    End Function

    Public Function GetXVel(xy As Point) As Double
        Dim pars As New PointRequestParameters With {.x = xy.X, .y = xy.Y, .frame = FrameTypes.XVel}
        Dim req As New RequestStream(lpProtocol, Protocols.RequestPoint, pars.GetJson)
        Dim data = requestData(req)

        Return BitConverter.ToDouble(data.ChunkBuffer)
    End Function

    Public Function GetYVel(xy As Point) As Double
        Dim pars As New PointRequestParameters With {.x = xy.X, .y = xy.Y, .frame = FrameTypes.YVel}
        Dim req As New RequestStream(lpProtocol, Protocols.RequestPoint, pars.GetJson)
        Dim data = requestData(req)

        Return BitConverter.ToDouble(data.ChunkBuffer)
    End Function
End Class
