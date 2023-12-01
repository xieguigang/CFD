<Global.Microsoft.VisualBasic.CompilerServices.DesignerGenerated()>
Partial Class Form1
    Inherits System.Windows.Forms.Form

    'Form overrides dispose to clean up the component list.
    <System.Diagnostics.DebuggerNonUserCode()>
    Protected Overrides Sub Dispose(ByVal disposing As Boolean)
        Try
            If disposing AndAlso components IsNot Nothing Then
                components.Dispose()
            End If
        Finally
            MyBase.Dispose(disposing)
        End Try
    End Sub

    'Required by the Windows Form Designer
    Private components As System.ComponentModel.IContainer

    'NOTE: The following procedure is required by the Windows Form Designer
    'It can be modified using the Windows Form Designer.  
    'Do not modify it using the code editor.
    <System.Diagnostics.DebuggerStepThrough()>
    Private Sub InitializeComponent()
        components = New ComponentModel.Container()
        Dim resources As System.ComponentModel.ComponentResourceManager = New System.ComponentModel.ComponentResourceManager(GetType(Form1))
        PictureBox1 = New PictureBox()
        Timer1 = New Timer(components)
        SplitContainer1 = New SplitContainer()
        PropertyGrid1 = New PropertyGrid()
        StatusStrip1 = New StatusStrip()
        ToolStripStatusLabel1 = New ToolStripStatusLabel()
        ToolStripStatusLabel2 = New ToolStripStatusLabel()
        ToolStripProgressBar1 = New ToolStripProgressBar()
        ToolTip1 = New ToolTip(components)
        ContextMenuStrip1 = New ContextMenuStrip(components)
        MarkPointToolStripMenuItem = New ToolStripMenuItem()
        CType(PictureBox1, ComponentModel.ISupportInitialize).BeginInit()
        CType(SplitContainer1, ComponentModel.ISupportInitialize).BeginInit()
        SplitContainer1.Panel1.SuspendLayout()
        SplitContainer1.Panel2.SuspendLayout()
        SplitContainer1.SuspendLayout()
        StatusStrip1.SuspendLayout()
        ContextMenuStrip1.SuspendLayout()
        SuspendLayout()
        ' 
        ' PictureBox1
        ' 
        PictureBox1.BackgroundImageLayout = ImageLayout.Stretch
        PictureBox1.ContextMenuStrip = ContextMenuStrip1
        PictureBox1.Cursor = Cursors.Cross
        PictureBox1.Dock = DockStyle.Fill
        PictureBox1.Location = New Point(0, 0)
        PictureBox1.Name = "PictureBox1"
        PictureBox1.Size = New Size(530, 428)
        PictureBox1.TabIndex = 0
        PictureBox1.TabStop = False
        ' 
        ' Timer1
        ' 
        Timer1.Enabled = True
        Timer1.Interval = 30
        ' 
        ' SplitContainer1
        ' 
        SplitContainer1.Dock = DockStyle.Fill
        SplitContainer1.Location = New Point(0, 0)
        SplitContainer1.Name = "SplitContainer1"
        ' 
        ' SplitContainer1.Panel1
        ' 
        SplitContainer1.Panel1.Controls.Add(PropertyGrid1)
        ' 
        ' SplitContainer1.Panel2
        ' 
        SplitContainer1.Panel2.Controls.Add(PictureBox1)
        SplitContainer1.Size = New Size(800, 428)
        SplitContainer1.SplitterDistance = 266
        SplitContainer1.TabIndex = 1
        ' 
        ' PropertyGrid1
        ' 
        PropertyGrid1.Dock = DockStyle.Fill
        PropertyGrid1.Location = New Point(0, 0)
        PropertyGrid1.Name = "PropertyGrid1"
        PropertyGrid1.Size = New Size(266, 428)
        PropertyGrid1.TabIndex = 0
        ' 
        ' StatusStrip1
        ' 
        StatusStrip1.Items.AddRange(New ToolStripItem() {ToolStripStatusLabel1, ToolStripStatusLabel2, ToolStripProgressBar1})
        StatusStrip1.Location = New Point(0, 428)
        StatusStrip1.Name = "StatusStrip1"
        StatusStrip1.Size = New Size(800, 22)
        StatusStrip1.TabIndex = 1
        StatusStrip1.Text = "StatusStrip1"
        ' 
        ' ToolStripStatusLabel1
        ' 
        ToolStripStatusLabel1.Image = My.Resources.Resources.icons8_backlog_96
        ToolStripStatusLabel1.Name = "ToolStripStatusLabel1"
        ToolStripStatusLabel1.Size = New Size(58, 17)
        ToolStripStatusLabel1.Text = "Ready!"
        ' 
        ' ToolStripStatusLabel2
        ' 
        ToolStripStatusLabel2.Name = "ToolStripStatusLabel2"
        ToolStripStatusLabel2.Size = New Size(40, 17)
        ToolStripStatusLabel2.Text = "[-1,-1]"
        ' 
        ' ToolStripProgressBar1
        ' 
        ToolStripProgressBar1.Name = "ToolStripProgressBar1"
        ToolStripProgressBar1.Size = New Size(100, 16)
        ' 
        ' ToolTip1
        ' 
        ToolTip1.ToolTipIcon = ToolTipIcon.Info
        ToolTip1.ToolTipTitle = "Point Information"
        ' 
        ' ContextMenuStrip1
        ' 
        ContextMenuStrip1.Items.AddRange(New ToolStripItem() {MarkPointToolStripMenuItem})
        ContextMenuStrip1.Name = "ContextMenuStrip1"
        ContextMenuStrip1.Size = New Size(133, 26)
        ' 
        ' MarkPointToolStripMenuItem
        ' 
        MarkPointToolStripMenuItem.Image = CType(resources.GetObject("MarkPointToolStripMenuItem.Image"), Image)
        MarkPointToolStripMenuItem.Name = "MarkPointToolStripMenuItem"
        MarkPointToolStripMenuItem.Size = New Size(132, 22)
        MarkPointToolStripMenuItem.Text = "Mark Point"
        ' 
        ' Form1
        ' 
        AutoScaleDimensions = New SizeF(7F, 15F)
        AutoScaleMode = AutoScaleMode.Font
        ClientSize = New Size(800, 450)
        Controls.Add(SplitContainer1)
        Controls.Add(StatusStrip1)
        Name = "Form1"
        Text = "Computational Fluid Dynamics"
        CType(PictureBox1, ComponentModel.ISupportInitialize).EndInit()
        SplitContainer1.Panel1.ResumeLayout(False)
        SplitContainer1.Panel2.ResumeLayout(False)
        CType(SplitContainer1, ComponentModel.ISupportInitialize).EndInit()
        SplitContainer1.ResumeLayout(False)
        StatusStrip1.ResumeLayout(False)
        StatusStrip1.PerformLayout()
        ContextMenuStrip1.ResumeLayout(False)
        ResumeLayout(False)
        PerformLayout()
    End Sub

    Friend WithEvents PictureBox1 As PictureBox
    Friend WithEvents Timer1 As Timer
    Friend WithEvents SplitContainer1 As SplitContainer
    Friend WithEvents PropertyGrid1 As PropertyGrid
    Friend WithEvents StatusStrip1 As StatusStrip
    Friend WithEvents ToolStripStatusLabel1 As ToolStripStatusLabel
    Friend WithEvents ToolStripProgressBar1 As ToolStripProgressBar
    Friend WithEvents ToolStripStatusLabel2 As ToolStripStatusLabel
    Friend WithEvents ToolTip1 As ToolTip
    Friend WithEvents ContextMenuStrip1 As ContextMenuStrip
    Friend WithEvents MarkPointToolStripMenuItem As ToolStripMenuItem

End Class
