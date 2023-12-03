Imports System.Drawing.Drawing2D
Imports System.Drawing.Text
Imports System.Runtime.CompilerServices
Imports System.Text
Imports CFD
Imports CFD_clr
Imports Microsoft.VisualBasic.ComponentModel.Ranges.Model
Imports Microsoft.VisualBasic.Imaging.Drawing2D.Colors
Imports Microsoft.VisualBasic.Imaging.Drawing2D.Colors.Scaler
Imports Microsoft.VisualBasic.Linq
Imports RibbonLib.Interop
Imports WeifenLuo.WinFormsUI.Docking
Imports bitmap = System.Drawing.Bitmap
Imports std = System.Math

Public Class frmCFDCanvas

    Dim CFD As CFDTcpProtocols
    Dim colors As SolidBrush()
    Dim offset As New DoubleRange(0, 255)
    Dim drawLine As Boolean = False
    Dim toolkit As New toolCFDParameters

    ReadOnly grays As SolidBrush() = Designer.GetBrushes(ScalerPalette.Gray.Description, 30)
    ReadOnly grayOffset As New DoubleRange(0, 29)

    Private Sub Timer1_Tick(sender As Object, e As EventArgs) Handles Timer1.Tick
        If CFD IsNot Nothing AndAlso CFD.ready Then
            Call Render(frame:=CFD.getFrameData(toolkit.pars.DrawFrameData))
        End If
    End Sub

    Private Sub Render(frame As Double()())
        Dim xyDims As Size = CFD.pars.getDims
        Dim bitmap As New bitmap(xyDims.Width, xyDims.Height)
        Dim g As Graphics = Graphics.FromImage(bitmap)
        Dim range As DoubleRange = frame.AsParallel.Select(Function(a) {a.Min, a.Max}).IteratesALL.Range
        Dim v As Double
        Dim index As Integer
        Dim cut As Double = Double.MaxValue

        If toolkit.pars.enableTrIQ Then
            cut = frame.IteratesALL.FindThreshold(toolkit.pars.TrIQ)
            range = New DoubleRange(range.Min, cut)
        End If

        g.CompositingQuality = CompositingQuality.HighSpeed
        g.TextRenderingHint = TextRenderingHint.SystemDefault
        g.SmoothingMode = SmoothingMode.None

        If range.Min.IsNaNImaginary OrElse range.Max.IsNaNImaginary Then
            Return
        End If

        For i As Integer = 0 To frame.Length - 1
            Dim row = frame(i)

            For j As Integer = 0 To row.Length - 1
                v = row(j)

                If toolkit.pars.enableTrIQ AndAlso v > cut Then
                    v = cut
                End If

                index = CInt(range.ScaleMapping(v, offset))
                g.FillRectangle(colors(index), New Rectangle(i, j, 1, 1))
            Next
        Next

        If ribbonItems.CheckShowTracer.BooleanValue Then
            For Each pt As PointF In CFD.moveTracers(toolkit.pars.TracerSpeedLevel)
                Call g.FillRectangle(Brushes.Black, New RectangleF(pt, New Size(1, 1)))
            Next
        End If
        If ribbonItems.CheckShowFlowLine.BooleanValue Then
            Call drawFlowlines(g)
        End If

        PictureBox1.BackgroundImage = bitmap
    End Sub

    Private Sub drawFlowlines(g As Graphics)
        Dim xyDims As Size = CFD.pars.getDims
        Dim xdim = xyDims.Width
        Dim ydim = xyDims.Height
        Dim lenX As Single = 13
        Dim lenY As Single = 8
        Dim xLines = xdim / lenX
        Dim yLines = ydim / lenY

        Dim ux = CFD.getFrameData(FrameTypes.XVel)
        Dim uy = CFD.getFrameData(FrameTypes.YVel)
        Dim speeds As New List(Of Double)

        For yCount As Integer = 0 To yLines - 1
            For xCount As Integer = 0 To xLines - 1
                Dim x = xCount * lenX
                Dim y = yCount * lenY
                Dim vx = ux(x)(y)
                Dim vy = uy(x)(y)
                Dim speed As Double = std.Sqrt(vx ^ 2 + vy ^ 2)

                speeds.Add(speed)
            Next
        Next

        Dim speedRange As New DoubleRange(speeds)

        For yCount As Integer = 0 To yLines - 1
            For xCount As Integer = 0 To xLines - 1
                Dim x = xCount * lenX
                Dim y = yCount * lenY
                Dim vx = ux(x)(y)
                Dim vy = uy(x)(y)
                Dim speed As Double = std.Sqrt(vx ^ 2 + vy ^ 2)

                If speed > 0.0001 Then
                    Dim scale = 300 * speed
                    Dim p0 As New PointF(x - vx * scale, y + vy * scale)
                    Dim p1 As New PointF(x + vx * scale, y - vy * scale)
                    Dim offset As Integer = speedRange.ScaleMapping(speed, grayOffset)
                    Dim color As SolidBrush = grays(offset)
                    Dim line As New Pen(color, 0.85)

                    g.DrawLine(line, p0, p1)
                End If
            Next
        Next
    End Sub

    Private Sub resetCFD()
        If CFD IsNot Nothing AndAlso CFD.ready Then
            Call CFD.reset()
        End If
    End Sub

    <MethodImpl(MethodImplOptions.AggressiveInlining)>
    Friend Sub UpdatePalette()
        offset = New DoubleRange(0, toolkit.pars.ColorLevels)
        colors = GetColors(toolkit.pars.Colors.Description, toolkit.pars.ColorLevels + 1) _
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
        If e.Button = MouseButtons.Left AndAlso CheckDrawBarrier() AndAlso CFD IsNot Nothing AndAlso CFD.ready Then
            ' Call reader.SetBarrierPoint(GetCFDPosition, 1)
        End If
    End Sub

    Private Function GetCFDPosition() As Point
        Dim xy As Point = PictureBox1.PointToClient(Cursor.Position)
        Dim sizeView As Size = PictureBox1.Size
        Dim dims As Size = CFD.pars.getDims
        Dim ratio As New SizeF(sizeView.Width / dims.Width, sizeView.Height / dims.Height)
        Dim x As Integer = xy.X / ratio.Width, y As Integer = xy.Y / ratio.Height

        If x < 0 Then x = 0
        If y < 0 Then y = 0
        If x >= dims.Width Then x = dims.Width - 1
        If y >= dims.Height Then y = dims.Height - 1

        Return New Point(x, y)
    End Function

    Private Sub PictureBox1_MouseMove(sender As Object, e As MouseEventArgs) Handles PictureBox1.MouseMove
        Dim xy = GetCFDPosition()
        Dim tooltip As New StringBuilder

        If drawLine AndAlso CheckDrawBarrier() Then
            'Call reader.SetBarrierPoint(xy, 1)
        End If

        Call Message($"[{xy.X},{xy.Y}]")

        Dim speed As Double = CFD.GetSpeed(xy)
        Dim density As Double = CFD.GetDensity(xy)
        Dim xvel As Double = CFD.GetXVel(xy)
        Dim yvel As Double = CFD.GetYVel(xy)

        tooltip.AppendLine($"point xy: ({xy.X},{xy.Y})")
        tooltip.AppendLine($"density: {density}")
        tooltip.AppendLine($"velocity: [{xvel},{yvel}]")

        'If reader.GetBarrier(xy) Then
        '    tooltip.AppendLine("current location is a barrier site")
        'End If

        ToolTip1.SetToolTip(PictureBox1, tooltip.ToString)
    End Sub

    Private Sub frmCFDCanvas_Load(sender As Object, e As EventArgs) Handles MyBase.Load
        UpdatePalette()
        CFD.reset()

        AddHandler ribbonItems.ButtonReset.ExecuteEvent, Sub() resetCFD()
        AddHandler ribbonItems.ButtonClearBarrier.ExecuteEvent, Sub()
                                                                    ' CFD.clearBarrier()
                                                                End Sub

        toolkit.Show(DockPanel)
        toolkit.DockState = DockState.DockLeft
        toolkit.SetTarget(callback:=Me)

        TabText = $"CFD Project - {Now.Year}{Now.Month.ToString.PadLeft(1, "0"c)}{Now.Day.ToString.PadLeft(1, "0"c)}-{App.ElapsedMilliseconds}"

        Call main.EnableVSRenderer(ContextMenuStrip1)
    End Sub

    Private Sub frmCFDCanvas_Activated(sender As Object, e As EventArgs) Handles Me.Activated
        ribbonItems.TabSimulationPage.ContextAvailable = ContextAvailability.Active
    End Sub

    Private Sub frmCFDCanvas_LostFocus(sender As Object, e As EventArgs) Handles Me.LostFocus
        ' ribbonItems.TabSimulationPage.ContextAvailable = ContextAvailability.NotAvailable
    End Sub

    Private Sub frmCFDCanvas_GotFocus(sender As Object, e As EventArgs) Handles Me.GotFocus
        ribbonItems.TabSimulationPage.ContextAvailable = ContextAvailability.Active
    End Sub
End Class