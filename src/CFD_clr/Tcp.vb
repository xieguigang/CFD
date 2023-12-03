Imports Microsoft.VisualBasic.ApplicationServices
Imports Microsoft.VisualBasic.CommandLine.InteropService.Pipeline
Imports Microsoft.VisualBasic.CommandLine.Reflection
Imports Microsoft.VisualBasic.Scripting.MetaData

<Package("Tcp")>
Module Tcp

    ''' <summary>
    ''' start the backend service
    ''' </summary>
    ''' <returns></returns>
    ''' <remarks>
    ''' the server thread will be blocked at here
    ''' </remarks>
    <ExportAPI("start")>
    Public Function start(Optional debug_port As Integer? = Nothing, Optional session_file As String = Nothing) As Object
        Dim session As New Backend(debug_port)
        Call RunSlavePipeline.SendMessage($"port={session.TcpPort}")

        If Not debug_port Is Nothing Then
            If session_file.StringEmpty Then
                ' save to temp
                session_file = TempFileSystem.GetAppSysTempFile(".cfd")
            End If

            Call session.Setup(New SetupParameters With {.storagefile = session_file})
        End If

        Return session.Run
    End Function
End Module
