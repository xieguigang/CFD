Imports System.Drawing
Imports CFD
Imports Microsoft.VisualBasic.Data.IO
Imports Microsoft.VisualBasic.Net
Imports Microsoft.VisualBasic.Net.Protocols.Reflection
Imports Microsoft.VisualBasic.Net.Tcp
Imports Microsoft.VisualBasic.Parallel

Public Class CFDTcpProtocols

    Public ReadOnly lpProtocol As Long = ProtocolAttribute.GetProtocolCategory(GetType(Protocols)).EntryPoint

    Public Const ok As String = "ok!"

    Public ReadOnly Property EndPoint As IPEndPoint
    Public ReadOnly Property dims As Size

    Private Function requestData(req As RequestStream) As RequestStream
        Return New TcpRequest(EndPoint).SendMessage(req)
    End Function

    Public Function getFrameData(type As FrameTypes) As Double()()
        Dim req As New RequestStream(lpProtocol, Protocols.RequestFrame, BitConverter.GetBytes(CInt(type)))
        Dim data = requestData(req)
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

        If data.GetUTF8String = ok Then
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

End Class
