Imports CFD
Imports Microsoft.VisualBasic.ComponentModel.Ranges.Model
Imports Microsoft.VisualBasic.Imaging.Drawing2D.Colors
Imports Microsoft.VisualBasic.Linq

Public Class Form1

    Dim CFD As New FluidDynamics(240, 150)
    Dim reader As New DataReader(CFD)
    Dim colors As SolidBrush()
    Dim offset As New DoubleRange(0, 255)

    Private Sub Timer1_Tick(sender As Object, e As EventArgs) Handles Timer1.Tick
        CFD.advance()

        Dim bitmap As New Bitmap(CFD.xdim, CFD.ydim)
        Dim g As Graphics = Graphics.FromImage(bitmap)
        Dim frame As Double()() = reader.GetSpeed
        Dim range As DoubleRange = frame.AsParallel.Select(Function(a) {a.Min, a.Max}).IteratesALL.Range

        For i As Integer = 0 To frame.Length - 1
            Dim row = frame(i)

            For j As Integer = 0 To row.Length - 1
                Call g.FillRectangle(colors(CInt(range.ScaleMapping(row(j), offset))), New Rectangle(i, j, 1, 1))
            Next
        Next

        PictureBox1.BackgroundImage = bitmap
    End Sub

    Private Sub Form1_Load(sender As Object, e As EventArgs) Handles Me.Load
        colors = Designer.GetColors(ScalerPalette.Jet.Description, 256).Select(Function(c) New SolidBrush(c)).ToArray
        CFD.reset()
    End Sub
End Class
