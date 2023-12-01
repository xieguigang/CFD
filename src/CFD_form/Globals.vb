Imports CFD_form.RibbonLib.Controls
Imports WeifenLuo.WinFormsUI.Docking

Module Globals

    Public ribbonItems As RibbonItems
    Public main As FormMain
    Public dockPanel As DockPanel

    Public Sub Message(str As String)
        main.ToolStripStatusLabel2.Text = str
    End Sub

End Module
