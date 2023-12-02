Public Class SplashScreen
    Private Sub SplashScreen_Load(sender As Object, e As EventArgs) Handles MyBase.Load
        Label3.Text = Label3.Text.Replace("%s", Environment.UserName)
    End Sub
End Class