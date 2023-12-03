Imports System.Runtime.CompilerServices
Imports Microsoft.VisualBasic.ApplicationServices.Debugging.Logging

Public Module Helpers

    ReadOnly logfile As String = $"{App.ProductSharedDIR}/moria_{Now.Year}{Now.Month.FormatZero}.log"

    Public Sub logCommandLine(app As String, commandLine As String, workdir As String,
                              <CallerMemberName>
                              Optional trace As String = Nothing)

        Dim log As New LogFile(Helpers.logfile, autoFlush:=True, append:=True)

        Call log.info($"app={app}", trace)
        Call log.info($"commandline={commandLine}", trace)
        Call log.Debug("workdir=%s", workdir)
        Call log.Debug("pipeline=""%s"" %s", app, commandLine)
        Call log.Dispose()
    End Sub
End Module
