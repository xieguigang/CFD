Imports CFD_win32.RibbonLib.Controls
Imports RibbonLib
Imports WeifenLuo.WinFormsUI.Docking

Public Class FormMain

    Dim ribbon1 As New Ribbon
    Dim vsToolStripExtender1 As New VisualStudioToolStripExtender
    Dim vS2015LightTheme1 As New VS2015LightTheme
    Dim dockPanel As New DockPanel

    ReadOnly _toolStripProfessionalRenderer As New ToolStripProfessionalRenderer()

    Sub New()

        ' 此调用是设计器所必需的。
        InitializeComponent()

        Me.Controls.Add(ribbon1)
        Me.Controls.Add(dockPanel)

        dockPanel.Dock = DockStyle.Fill
        dockPanel.ShowDocumentIcon = True
        dockPanel.DockLeftPortion = 250.0R

        vsToolStripExtender1.DefaultRenderer = _toolStripProfessionalRenderer

        ' 在 InitializeComponent() 调用之后添加任何初始化。
        ribbon1.ResourceName = $"CFD_win32.RibbonMarkup.ribbon"
        ribbon1.Dock = DockStyle.Top
        ribbon1.Height = 100
        ribbon1.SendToBack()
        ribbonItems = New RibbonItems(ribbon1)

        dockPanel.BringToFront()

        Globals.ribbonItems = ribbonItems
        Globals.dockPanel = dockPanel
        Globals.main = Me
    End Sub

    Private Sub Form1_Load(sender As Object, e As EventArgs) Handles MyBase.Load
        dockPanel.Theme = vS2015LightTheme1
        EnableVSRenderer(StatusStrip1)

        AddHandler ribbonItems.ButtonAbout.ExecuteEvent, Sub() Call New SplashScreen() With {.ShowAbout = True}.Show()
        AddHandler ribbonItems.ButtonAppExit.ExecuteEvent, Sub() Call Me.Close()
        AddHandler ribbonItems.FileNew.ExecuteEvent, Sub() Call CreateNewSimulation()
        AddHandler ribbonItems.ButtonLicense.ExecuteEvent, Sub() Call New FormLicense().ShowDialog()
    End Sub

    Friend Sub EnableVSRenderer(ParamArray toolStrips As ToolStrip())
        For Each tool In toolStrips
            vsToolStripExtender1.SetStyle(tool, VisualStudioToolStripExtender.VsVersion.Vs2015, vS2015LightTheme1)
        Next
    End Sub

    Private Sub CreateNewSimulation()
        Using folder As New FolderBrowserDialog With {
            .ShowNewFolderButton = True,
            .Description = "Select a folder for save simulation session result."
        }
            If folder.ShowDialog = DialogResult.OK Then
                Dim CFD As New frmCFDCanvas With {.Workspace = folder.SelectedPath}

                CFD.Show(dockPanel)
                CFD.DockState = DockState.Document
            End If
        End Using
    End Sub

    Private Sub FormMain_FormClosing(sender As Object, e As FormClosingEventArgs) Handles MyBase.FormClosing

    End Sub
End Class
