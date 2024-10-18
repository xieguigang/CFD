Imports System.Drawing
Imports Microsoft.VisualBasic.ComponentModel.Collection
Imports Microsoft.VisualBasic.Imaging
Imports Microsoft.VisualBasic.Imaging.BitmapImage
Imports SkiaSharp

Public Module ModelLoader

    Public Sub LoadModelFile(filepath As String, CFD As FluidDynamics)
        Dim skia = SKBitmap.Decode(filepath)
        Dim img As New Bitmap(New BitmapBuffer(skia.Bytes, New Size(skia.Width, skia.Height), skia.BytesPerPixel))
        Dim rasterModel As Boolean()() = RectangularArray.Matrix(Of Boolean)(CFD.xdim, CFD.ydim)

        If img.Width <> CFD.xdim OrElse img.Height <> CFD.ydim Then
            ' resize image
            img = img.Resize(CFD.xdim, CFD.ydim)
        End If

        ' transparent is none
        For i As Integer = 0 To CFD.xdim - 1
            For j As Integer = 0 To CFD.ydim - 1
                ' removes the pre-defined model
                rasterModel(i)(j) = False
                rasterModel(i)(j) = Not img.GetPixel(i, j).IsTransparent
            Next
        Next

        CFD.barrier = rasterModel
    End Sub
End Module
