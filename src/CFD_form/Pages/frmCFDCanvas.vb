﻿Imports System.Runtime.CompilerServices
Imports System.Text
Imports CFD
Imports CFD_form.RibbonLib.Controls
Imports Microsoft.VisualBasic.ComponentModel.Ranges.Model
Imports Microsoft.VisualBasic.Imaging.Drawing2D.Colors
Imports Microsoft.VisualBasic.Linq
Imports WeifenLuo.WinFormsUI.Docking


Public Class frmCFDCanvas

    Dim CFD As New FluidDynamics(600, 480, 2500)
    Dim reader As CFDHelper
    Dim colors As SolidBrush()
    Dim offset As New DoubleRange(0, 255)
    Dim drawLine As Boolean = False
    Dim toolkit As New toolCFDParameters

    Sub New()

        ' 此调用是设计器所必需的。
        InitializeComponent()

        ' 在 InitializeComponent() 调用之后添加任何初始化。
        reader = New CFDHelper(CFD, Timer1)
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

        If range.Min.IsNaNImaginary OrElse range.Max.IsNaNImaginary Then
            Return
        End If

        For i As Integer = 0 To frame.Length - 1
            Dim row = frame(i)

            For j As Integer = 0 To row.Length - 1
                Call g.FillRectangle(colors(CInt(range.ScaleMapping(row(j), offset))), New Rectangle(i, j, 1, 1))
            Next
        Next

        If ribbonItems.CheckShowTracer.BooleanValue Then
            For Each pt As PointF In CFD.moveTracers(reader.TracerSpeedLevel)
                Call g.FillRectangle(Brushes.Black, New RectangleF(pt, New Size(2, 2)))
            Next
        End If

        PictureBox1.BackgroundImage = bitmap
    End Sub

    Private Sub resetCFD()
        Call CFD.reset()
    End Sub

    <MethodImpl(MethodImplOptions.AggressiveInlining)>
    Friend Sub UpdatePalette()
        offset = New DoubleRange(0, reader.ColorLevels)
        colors = GetColors(reader.Colors.Description, reader.ColorLevels + 1) _
            .Select(Function(c) New SolidBrush(c)) _
            .ToArray
    End Sub

    Private Sub PictureBox1_MouseUp(sender As Object, e As MouseEventArgs) Handles PictureBox1.MouseUp
        drawLine = False
    End Sub

    Private Sub PictureBox1_MouseDown(sender As Object, e As MouseEventArgs) Handles PictureBox1.MouseDown
        If e.Button = MouseButtons.Left Then
            drawLine = CheckDrawBarrier()
        End If
    End Sub

    Private Function CheckDrawBarrier() As Boolean
        Return ribbonItems.CheckDrawBarrier.BooleanValue
    End Function

    Private Sub PictureBox1_MouseClick(sender As Object, e As MouseEventArgs) Handles PictureBox1.MouseClick
        If e.Button = MouseButtons.Left AndAlso CheckDrawBarrier() Then
            Call reader.SetBarrierPoint(GetCFDPosition, 1)
        End If
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

        If drawLine AndAlso CheckDrawBarrier() Then
            Call reader.SetBarrierPoint(xy, 1)
        End If

        Call Message($"[{xy.X},{xy.Y}]")

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

    Private Sub frmCFDCanvas_Load(sender As Object, e As EventArgs) Handles MyBase.Load
        UpdatePalette()
        CFD.reset()

        AddHandler ribbonItems.ButtonReset.ExecuteEvent, Sub() resetCFD()
        AddHandler ribbonItems.ButtonClearBarrier.ExecuteEvent, Sub() CFD.clearBarrier()

        toolkit.Show(DockPanel)
        toolkit.DockState = DockState.DockLeft
        toolkit.SetTarget(reader, callback:=Me)

        TabText = "Computational Fluid Dynamics"

        Call main.EnableVSRenderer(ContextMenuStrip1)
    End Sub
End Class