﻿<Global.Microsoft.VisualBasic.CompilerServices.DesignerGenerated()> _
Partial Class toolCFDParameters
    Inherits ToolWindow

    'Form 重写 Dispose，以清理组件列表。
    <System.Diagnostics.DebuggerNonUserCode()> _
    Protected Overrides Sub Dispose(ByVal disposing As Boolean)
        Try
            If disposing AndAlso components IsNot Nothing Then
                components.Dispose()
            End If
        Finally
            MyBase.Dispose(disposing)
        End Try
    End Sub

    'Windows 窗体设计器所必需的
    Private components As System.ComponentModel.IContainer

    '注意: 以下过程是 Windows 窗体设计器所必需的
    '可以使用 Windows 窗体设计器修改它。  
    '不要使用代码编辑器修改它。
    <System.Diagnostics.DebuggerStepThrough()> _
    Private Sub InitializeComponent()
        PropertyGrid1 = New PropertyGrid()
        SuspendLayout()
        ' 
        ' PropertyGrid1
        ' 
        PropertyGrid1.Dock = DockStyle.Fill
        PropertyGrid1.Location = New Point(0, 0)
        PropertyGrid1.Name = "PropertyGrid1"
        PropertyGrid1.Size = New Size(800, 450)
        PropertyGrid1.TabIndex = 0
        ' 
        ' toolCFDParameters
        ' 
        AutoScaleDimensions = New SizeF(7F, 15F)
        AutoScaleMode = AutoScaleMode.Font
        ClientSize = New Size(800, 450)
        Controls.Add(PropertyGrid1)
        Name = "toolCFDParameters"
        Text = "Form1"
        ResumeLayout(False)
    End Sub

    Friend WithEvents PropertyGrid1 As PropertyGrid
End Class
