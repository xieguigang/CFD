Imports System.Drawing

Public Class SetupParameters

    Public Property storagefile As String
    Public Property max_time As Integer = 10 ^ 8
    Public Property dims As Integer() = {600, 480}
    Public Property interval As Integer = 30
    Public Property n_tracers As Integer = 2500

    ''' <summary>
    ''' A png file for create the barrier model
    ''' </summary>
    ''' <returns></returns>
    Public Property modelfile As String

    Public Function getDims() As Size
        Return New Size(_dims(0), _dims(1))
    End Function

End Class
