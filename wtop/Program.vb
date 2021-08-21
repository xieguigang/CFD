Imports System
Imports System.Threading

Module Program

    Sub Main(args As String())
        Do While True
            Call ProcessExplorer.Print()
            Call Thread.Sleep(ProcessExplorer.internalMs)
        Loop
    End Sub
End Module
