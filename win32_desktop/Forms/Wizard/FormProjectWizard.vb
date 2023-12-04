Imports CFD_clr
Imports Microsoft.VisualBasic.Imaging

Public Class FormProjectWizard

    Public Function GetParameters(workspace As String) As SetupParameters
        Return New SetupParameters With {
            .dims = {Integer.Parse(TextBox2.Text), Integer.Parse(TextBox3.Text)},
            .modelfile = TextBox1.Text,
            .storagefile = $"{workspace}/data.CFD"
        }
    End Function

    Private Sub Button2_Click(sender As Object, e As EventArgs) Handles Button2.Click
        Me.DialogResult = DialogResult.Cancel
    End Sub

    Private Sub Button1_Click(sender As Object, e As EventArgs) Handles Button1.Click
        Me.DialogResult = DialogResult.OK
    End Sub

    Private Sub Button3_Click(sender As Object, e As EventArgs) Handles Button3.Click, TextBox1.Click
        Using file As New OpenFileDialog With {.Filter = "Model Image(*.png)|*.png"}
            If file.ShowDialog = DialogResult.OK Then
                TextBox1.Text = file.FileName

                Try
                    Dim img As Image = file.FileName.LoadImage

                    TextBox2.Text = img.Width
                    TextBox3.Text = img.Height
                Catch ex As Exception

                End Try
            End If
        End Using
    End Sub
End Class