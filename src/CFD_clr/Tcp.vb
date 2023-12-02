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
        Return New Backend(debug_port).Run
    End Function
End Module
