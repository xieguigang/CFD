Imports System.Runtime.CompilerServices
Imports System.Text
Imports System.Windows.Forms.VisualStyles.VisualStyleElement
Imports CFD
Imports CFD_form.RibbonLib.Controls
Imports Microsoft.VisualBasic.ComponentModel.Ranges.Model
Imports Microsoft.VisualBasic.Imaging.Drawing2D.Colors
Imports Microsoft.VisualBasic.Linq
Imports RibbonLib
Imports WeifenLuo.WinFormsUI.Docking

Public Class FormMain

    Dim ribbon1 As New Ribbon
    Dim vsToolStripExtender1 As New VisualStudioToolStripExtender
    Dim vS2015LightTheme1 As New VS2015LightTheme
    Dim dockPanel As New DockPanel
    Dim CFD As New frmCFDCanvas

    ReadOnly _toolStripProfessionalRenderer As New ToolStripProfessionalRenderer()

    Sub New()

        ' 此调用是设计器所必需的。
        InitializeComponent()

        Me.Controls.Add(ribbon1)
        Me.Controls.Add(dockPanel)

        dockPanel.Dock = DockStyle.Fill

        vsToolStripExtender1.DefaultRenderer = _toolStripProfessionalRenderer

        ' 在 InitializeComponent() 调用之后添加任何初始化。
        ribbon1.ResourceName = $"{App.AssemblyName}.RibbonMarkup.ribbon"
        ribbon1.Dock = DockStyle.Top
        ribbon1.Height = 100
        ribbon1.SendToBack()
        ribbonItems = New RibbonItems(ribbon1)

        dockPanel.SendToBack()

        Globals.ribbonItems = ribbonItems
        Globals.dockPanel = dockPanel
        Globals.main = Me
    End Sub

    Private Sub Form1_Load(sender As Object, e As EventArgs) Handles MyBase.Load
        dockPanel.Theme = vS2015LightTheme1
        EnableVSRenderer(VisualStudioToolStripExtender.VsVersion.Vs2015, vS2015LightTheme1)
        CFD.Show(dockPanel)
        CFD.DockState = DockState.Document
    End Sub

    Private Sub EnableVSRenderer(ByVal version As VisualStudioToolStripExtender.VsVersion, ByVal theme As ThemeBase)
        vsToolStripExtender1.SetStyle(StatusStrip1, version, theme)
    End Sub
End Class
