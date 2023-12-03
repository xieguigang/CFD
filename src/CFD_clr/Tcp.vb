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
    Public Function start(Optional debug_port As Integer? = Nothing) As Object
        Dim session As New Backend(debug_port)
        Call RunSlavePipeline.SendMessage($"port={session.TcpPort}")
        Return session.Run
    End Function
End Module
