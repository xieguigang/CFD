Public Class SplashScreen

    Public ShowAbout As Boolean = False

    Private Sub SplashScreen_Load(sender As Object, e As EventArgs) Handles MyBase.Load
        Label3.Text = Label3.Text.Replace("%s", Environment.UserName)
    End Sub

    Private Sub SplashScreen_LostFocus(sender As Object, e As EventArgs) Handles MyBase.LostFocus
        If ShowAbout Then
            Close()
        End If
    End Sub
End Class