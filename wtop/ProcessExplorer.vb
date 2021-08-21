Imports Microsoft.VisualBasic.ApplicationServices.Terminal
Imports Microsoft.VisualBasic.ComponentModel.Collection

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

    Private Sub GetCurrentSample()
        Dim instances As Process() = Process.GetProcesses
        Dim runningId As Index(Of Integer) = instances.Select(Function(p) p.Id).Indexing

        For Each app As Process In instances
            If app.Id = 0 Then
                Continue For
            End If

            If processList.ContainsKey(app.Id) Then
                processList(app.Id).Refresh()
            ElseIf Not app.HasExited Then
                processList(app.Id) = New ProcessItem(app)
            End If
        Next

        For Each id As Integer In processList.Keys.ToArray
            If Not id Like runningId Then
                processList.Remove(id)
            ElseIf processList(id).process.HasExited Then
                processList.Remove(id)
            End If
        Next
    End Sub

    Private Sub RenderOutput()
        Dim sample As String()() = processList.Values _
            .Where(Function(p) Not p.delta Is Nothing) _
            .Select(Function(p) p.delta) _
            .OrderByDescending(Function(p) p.cpuTime) _
            .Take(Console.WindowHeight - 3) _
            .Select(Function(p) New String() {p.pid, p.processName, p.cpuTime.TotalMilliseconds / internalMs, p.mem / 1024 / 1024}) _
            .ToArray

        If sample.Length > 0 Then
            Call sample.PrintTable
        End If
    End Sub

End Module

Public Class ProcessItem

    Dim oldSample As CounterSample

    Friend ReadOnly process As Process
    Friend delta As CounterSample

    Sub New(p As Process)
        process = p
        oldSample = New CounterSample(p)
    End Sub

    Public Sub Refresh()
        Call process.Refresh()

        If Not process.HasExited Then
            delta = process - oldSample
        End If
    End Sub
End Class

Public Class CounterSample

    Public cpuTime As TimeSpan
    Public mem As Long
    Public pid As Integer
    Public processName As String

    Sub New(p As Process)
        cpuTime = p.TotalProcessorTime
        mem = p.WorkingSet64
    End Sub

    Sub New()
    End Sub

    Public Shared Operator -(current As Process, sample As CounterSample) As CounterSample
        Dim deltaCPU As TimeSpan = current.TotalProcessorTime - sample.cpuTime

        sample.cpuTime = current.TotalProcessorTime

        Return New CounterSample With {
            .cpuTime = deltaCPU,
            .mem = current.WorkingSet64,
            .pid = current.Id,
            .processName = current.ProcessName
        }
    End Operator

End Class