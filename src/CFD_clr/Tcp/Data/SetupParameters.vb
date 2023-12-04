Imports System.Drawing
Imports Microsoft.VisualBasic.Imaging

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

    Public Shared Function CreateSetup(out As String, model As String) As SetupParameters
        Dim bmp As Bitmap = Nothing
        Dim dims As Integer() = {600, 480}

        If model.FileExists Then
            bmp = model.LoadImage
            dims = {bmp.Width, bmp.Height}
        End If

        Return New SetupParameters With {
            .dims = dims,
            .modelfile = model,
            .storagefile = out
        }
    End Function

End Class
