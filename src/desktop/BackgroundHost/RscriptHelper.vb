Imports System.Threading
Imports Microsoft.VisualBasic.CommandLine.InteropService.Pipeline

Public NotInheritable Class RscriptHelper

    ''' <summary>
    ''' executable file location of Rscript.exe
    ''' </summary>
    ''' <returns></returns>
    Public Shared ReadOnly Property RscriptHost As String
    ''' <summary>
    ''' folder location for store the R# script files.
    ''' </summary>
    ''' <returns></returns>
    Public Shared ReadOnly Property RscriptFolder As String

    Shared Sub New()
        RscriptHost = $"{App.HOME}/Rstudio\bin\Rscript.exe"

        If ENV.developmentEnv Then
            RscriptFolder = $"{App.HOME}/../../src\Rstudio"
        End If
    End Sub

    Private Sub New()
    End Sub

    Public Shared Function GetRscript(filename As String) As String
        Return $"{RscriptFolder}/{filename}".GetFullPath
    End Function

    ''' <summary>
    ''' create a new CFD server
    ''' </summary>
    ''' <returns>the tcp port number, negative or zero means create not success</returns>
    Public Shared Function CreateCFDServer(await As Double, log As Action(Of String)) As Integer
        Dim script As String = GetRscript("Moira-CFD.R")
        Dim pip As New RunSlavePipeline(RscriptHost, script, RscriptHost.ParentPath)
        Dim task As New Thread(AddressOf pip.Run)
        Dim port As Integer? = Nothing
        Dim sleepTime As Double = 10
        Dim totalMs As Double = await * 1000
        Dim t As Double = 0

        AddHandler pip.SetMessage,
            Sub(msg)
                If msg.IsPattern("port[=]\d+") Then
                    port = Val(msg.Split("="c).Last)
                Else
                    log(msg)
                End If
            End Sub

        Call Helpers.logCommandLine(RscriptHost, script, RscriptHost.ParentPath)
        Call task.Start()

        Do While t < totalMs
            If Not port Is Nothing Then
                Exit Do
            End If

            Call Thread.Sleep(sleepTime)
        Loop

        If port Is Nothing Then
            Return -1
        Else
            Return port
        End If
    End Function

End Class
