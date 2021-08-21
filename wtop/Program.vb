Imports System
Imports System.Threading

Module Program

    Sub Main(args As String())
        Do While True
            Call Console.Clear()
            Call ProcessExplorer.Print()
            Call Thread.Sleep(500)
        Loop
    End Sub
End Module
