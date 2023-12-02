Imports System.Drawing
Imports CFD
Imports Microsoft.VisualBasic.Data.IO
Imports Microsoft.VisualBasic.Net
Imports Microsoft.VisualBasic.Net.Protocols.Reflection
Imports Microsoft.VisualBasic.Net.Tcp
Imports Microsoft.VisualBasic.Parallel

Public Class TcpProtocols

    Public ReadOnly lpProtocol As Long = ProtocolAttribute.GetProtocolCategory(GetType(Protocols)).EntryPoint

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

End Class
