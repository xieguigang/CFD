Imports System.Management
Imports Microsoft.VisualBasic.ApplicationServices.Terminal
Imports Microsoft.VisualBasic.ComponentModel.Collection
Imports stdNum = System.Math

Module ProcessExplorer

    ReadOnly processList As New Dictionary(Of Integer, ProcessItem)

    ''' <summary>
    ''' refresh interval in time unit ms
    ''' </summary>
    Public internalMs As Double = 1000

    Public Sub Print()
        Call GetCurrentSample()
        Call Console.Clear()
        Call RenderOutput()
    End Sub

    Private Function ProcessQuery() As IEnumerable(Of Process)
        Return From app As Process
               In Process.GetProcesses.Shuffles
               Where app.Id <> 0 AndAlso Not app.HasExited
               Take Console.WindowHeight - 2
    End Function

    Private Sub GetCurrentSample()
        Dim instances As Process() = ProcessQuery.ToArray
        Dim runningId As Index(Of Integer) = instances.Select(Function(p) p.Id).Indexing
        Dim init0 As Boolean = processList.Count = 0

        For Each app As Process In instances
            If app.Id = 0 Then
                Continue For
            End If

            If processList.ContainsKey(app.Id) Then
                processList(app.Id).Refresh()
            ElseIf Not app.HasExited Then
                processList(app.Id) = New ProcessItem(app)
            End If

            If init0 Then
                Call Console.WriteLine($"Loading [{app.Id}] {app.ProcessName}...({processList.Count}/{instances.Length})")
            End If
        Next

        For Each id As Integer In processList.Keys.ToArray
            If processList(id).process.HasExited Then
                processList.Remove(id)
            End If
        Next
    End Sub

    Private Sub RenderOutput()
        Dim maxChars As Integer = Console.WindowWidth - 100

        If maxChars < 16 Then
            maxChars = 16
        End If

        Dim sample As String()() = processList.Values _
            .Where(Function(p) Not p.snapshot Is Nothing) _
            .Select(Function(p) p.snapshot) _
            .OrderByDescending(Function(p) p.cpuTime) _
            .Take(Console.WindowHeight - 10) _
            .Select(Function(p)
                        Return New String() {
                            p.pid,
                            Mid(p.processName, 1, 16),
                            (p.cpuTime.TotalMilliseconds / internalMs).ToString("F1"),
                            p.totalCPU.FormatTime,
                            (p.mem / 1024 / 1024).ToString("F2"),
                            p.threads,
                            Mid(p.commandLine, 1, stdNum.Min(maxChars, p.commandLine.Length))
                        }
                    End Function) _
            .ToArray

        If sample.Length > 0 Then
            Dim totalCPU As Double = Aggregate p As ProcessItem In processList.Values Into Sum(p.snapshot.cpuTime.TotalMilliseconds)
            Dim totalmemory As Double = Aggregate p As ProcessItem In processList.Values Into Sum(p.snapshot.mem)

            Call Console.WriteLine($"CPU Usage: {(totalCPU / internalMs).ToString("F2")}%")
            Call Console.WriteLine($"Memory: {(totalmemory / 1024 / 1024 / 1024).ToString("F2")}GB")
            Call Console.WriteLine($"Process: {processList.Count}")
            Call Console.WriteLine()
            Call sample.PrintTable(title:={"PID", "Process Name", "CPU%", "Total CPU Time", "Memory(MB)", "Threads", "CommandLine"})
        End If
    End Sub

End Module

Public Class ProcessItem

    Friend snapshot As CounterSample

    Friend ReadOnly process As Process
    Friend ReadOnly commandLine As String

    Dim total As TimeSpan
    Dim oldCPU As TimeSpan

    Sub New(p As Process)
        process = p

        Using searcher As New ManagementObjectSearcher("SELECT CommandLine FROM Win32_Process WHERE ProcessId = " & p.Id)
            Using objects As ManagementObjectCollection = searcher.Get()
                commandLine = objects.Cast(Of ManagementBaseObject).SingleOrDefault()?("CommandLine")?.ToString()
                commandLine = Strings.Trim(commandLine).Trim(""""c)
            End Using
        End Using

        If Not p.HasExited Then
            total = p.TotalProcessorTime
            snapshot = New CounterSample(Me)
        End If
    End Sub

    Public Sub Refresh()
        Call process.Refresh()

        If Not process.HasExited Then
            snapshot = New CounterSample(Me)
            snapshot.totalCPU = total
            snapshot.cpuTime = process.TotalProcessorTime - oldCPU
            oldCPU = process.TotalProcessorTime
            total += process.TotalProcessorTime
        End If
    End Sub
End Class

Public Class CounterSample

    Public cpuTime As TimeSpan
    Public totalCPU As TimeSpan
    Public mem As Long
    Public pid As Integer
    Public processName As String
    Public threads As Integer
    Public commandLine As String

    Sub New(current As ProcessItem)
        Dim process As Process = current.process

        cpuTime = process.TotalProcessorTime
        mem = process.WorkingSet64
        pid = process.Id
        processName = process.ProcessName
        commandLine = current.commandLine
        threads = process.Threads.Count
        totalCPU = process.TotalProcessorTime
    End Sub
End Class