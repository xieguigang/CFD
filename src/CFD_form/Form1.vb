Imports CFD
Imports CFD_form.RibbonLib.Controls
Imports Microsoft.VisualBasic.ComponentModel.Ranges.Model
Imports Microsoft.VisualBasic.Imaging.Drawing2D.Colors
Imports Microsoft.VisualBasic.Linq
Imports RibbonLib

Public Class Form1

    Dim CFD As New FluidDynamics(300, 200)
    Dim reader As New DataAdapter(CFD)
    Dim colors As SolidBrush()
    Dim offset As New DoubleRange(0, 255)
    Dim ribbon1 As New Ribbon
    Dim ribbonItems As RibbonItems

    Sub New()

        ' 此调用是设计器所必需的。
        InitializeComponent()

        ' 在 InitializeComponent() 调用之后添加任何初始化。
        ribbon1.ResourceName = $"{App.AssemblyName}.RibbonMarkup.ribbon"
        ribbon1.Dock = DockStyle.Top
        ribbon1.Height = 100
        ribbon1.SendToBack()
        ribbonItems = New RibbonItems(ribbon1)
    End Sub

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

    Private Sub Form1_Load(sender As Object, e As EventArgs) Handles MyBase.Load


        colors = GetColors(ScalerPalette.Jet.Description, 256).Select(Function(c) New SolidBrush(c)).ToArray
        CFD.reset()
        PropertyGrid1.SelectedObject = reader
        PropertyGrid1.Refresh()
    End Sub

    Private Sub PictureBox1_Click(sender As Object, e As EventArgs) Handles PictureBox1.Click
        Dim xy As Point = PictureBox1.PointToClient(Cursor.Position)

    End Sub
End Class
