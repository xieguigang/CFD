﻿Imports System.Runtime.CompilerServices
Imports System.Text
Imports CFD
Imports CFD_form.RibbonLib.Controls
Imports Microsoft.VisualBasic.ComponentModel.Ranges.Model
Imports Microsoft.VisualBasic.Imaging.Drawing2D.Colors
Imports Microsoft.VisualBasic.Linq
Imports RibbonLib

Public Class Form1

    Dim CFD As New FluidDynamics(300, 200)
    Dim reader As New CFDHelper(CFD)
    Dim colors As SolidBrush()
    Dim offset As New DoubleRange(0, 255)
    Dim ribbon1 As New Ribbon
    Dim ribbonItems As RibbonItems

    Sub New()

        ' 此调用是设计器所必需的。
        InitializeComponent()

        Me.Controls.Add(ribbon1)

        ' 在 InitializeComponent() 调用之后添加任何初始化。
        ribbon1.ResourceName = $"{App.AssemblyName}.RibbonMarkup.ribbon"
        ribbon1.Dock = DockStyle.Top
        ribbon1.Height = 100
        ribbon1.SendToBack()
        ribbonItems = New RibbonItems(ribbon1)
    End Sub

    Private Sub Timer1_Tick(sender As Object, e As EventArgs) Handles Timer1.Tick
        Call CFD.advance()

        Select Case reader.DrawFrameData
            Case FrameTypes.Speed : Call Render(frame:=reader.GetSpeed)
            Case FrameTypes.Density : Call Render(frame:=reader.GetDensity)
            Case FrameTypes.XVel : Call Render(frame:=reader.GetXVel)
            Case FrameTypes.YVel : Call Render(frame:=reader.GetYVel)
        End Select
    End Sub

    Private Sub Render(frame As Double()())
        Dim bitmap As New Bitmap(CFD.xdim, CFD.ydim)
        Dim g As Graphics = Graphics.FromImage(bitmap)
        Dim range As DoubleRange = frame.AsParallel.Select(Function(a) {a.Min, a.Max}).IteratesALL.Range

        For i As Integer = 0 To frame.Length - 1
            Dim row = frame(i)

            For j As Integer = 0 To row.Length - 1
                Call g.FillRectangle(colors(CInt(range.ScaleMapping(row(j), offset))), New Rectangle(i, j, 1, 1))
            Next
        Next

        PictureBox1.BackgroundImage = bitmap
    End Sub

    Private Sub Form1_Load(sender As Object, e As EventArgs) Handles MyBase.Load
        UpdatePalette()
        CFD.reset()
        PropertyGrid1.SelectedObject = reader
        PropertyGrid1.Refresh()

        AddHandler ribbonItems.ButtonReset.ExecuteEvent, Sub() Call resetCFD()
    End Sub

    Private Sub resetCFD()
        Call CFD.reset()
    End Sub

    <MethodImpl(MethodImplOptions.AggressiveInlining)>
    Private Sub UpdatePalette()
        offset = New DoubleRange(0, reader.ColorLevels)
        colors = GetColors(reader.Colors.Description, reader.ColorLevels + 1) _
            .Select(Function(c) New SolidBrush(c)) _
            .ToArray
    End Sub

    Private Sub PictureBox1_Click(sender As Object, e As EventArgs) Handles PictureBox1.Click
        Call reader.SetBarrierPoint(GetCFDPosition, 1)
    End Sub

    Private Function GetCFDPosition() As Point
        Dim xy As Point = PictureBox1.PointToClient(Cursor.Position)
        Dim sizeView As Size = PictureBox1.Size
        Dim ratio As New SizeF(sizeView.Width / CFD.xdim, sizeView.Height / CFD.ydim)
        Dim x As Integer = xy.X / ratio.Width, y As Integer = xy.Y / ratio.Height

        If x < 0 Then x = 0
        If y < 0 Then y = 0
        If x >= CFD.xdim Then x = CFD.xdim - 1
        If y >= CFD.ydim Then y = CFD.ydim - 1

        Return New Point(x, y)
    End Function

    Private Sub PictureBox1_MouseMove(sender As Object, e As MouseEventArgs) Handles PictureBox1.MouseMove
        Dim xy = GetCFDPosition()
        Dim tooltip As New StringBuilder

        If drawLine Then
            Call reader.SetBarrierPoint(xy, 1)
        End If

        ToolStripStatusLabel2.Text = $"[{xy.X},{xy.Y}]"

        Dim speed As Double = reader.GetSpeed(xy)
        Dim density As Double = reader.GetDensity(xy)
        Dim xvel As Double = reader.GetXVel(xy)
        Dim yvel As Double = reader.GetYVel(xy)

        tooltip.AppendLine($"point xy: ({xy.X},{xy.Y})")
        tooltip.AppendLine($"density: {density}")
        tooltip.AppendLine($"velocity: [{xvel},{yvel}]")

        If reader.GetBarrier(xy) Then
            tooltip.AppendLine("current location is a barrier site")
        End If

        ToolTip1.SetToolTip(PictureBox1, tooltip.ToString)
    End Sub

    Private Sub PropertyGrid1_PropertyValueChanged(s As Object, e As PropertyValueChangedEventArgs) Handles PropertyGrid1.PropertyValueChanged
        Select Case e.ChangedItem.Label
            Case NameOf(CFDHelper.DrawFrameData)
                ' do nothing
            Case NameOf(CFDHelper.Colors), NameOf(CFDHelper.ColorLevels)
                Call UpdatePalette()
        End Select

        e.ChangedItem.Select()
    End Sub

    Dim drawLine As Boolean = False

    Private Sub PictureBox1_MouseUp(sender As Object, e As MouseEventArgs) Handles PictureBox1.MouseUp
        drawLine = False
    End Sub

    Private Sub PictureBox1_MouseDown(sender As Object, e As MouseEventArgs) Handles PictureBox1.MouseDown
        drawLine = True
    End Sub
End Class
