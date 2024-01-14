Imports Microsoft.VisualBasic.Serialization.JSON

Namespace My

    Public Class Settings

        Public Property form_pos As Integer() = {100, 100}
        Public Property form_size As Integer() = {800, 500}

        Shared ReadOnly default_file As String = $"{App.ProductProgramData}/workbench_settings.json"

        Public Shared Function LoadSettings() As Settings
            If Not default_file.FileExists Then
                Call New Settings().GetJson.SaveTo(default_file)
            End If

            Dim config As Settings = default_file.LoadJsonFile(Of Settings)

            If config.form_pos.TryCount < 2 Then
                config.form_pos = {100, 100}
            End If
            If config.form_size.TryCount < 2 Then
                config.form_size = {800, 500}
            End If

            Return config
        End Function

        Public Sub Save()
            Call Me.GetJson.SaveTo(default_file)
        End Sub

    End Class
End Namespace