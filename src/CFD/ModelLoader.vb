Imports System.Drawing
Imports Microsoft.VisualBasic.ComponentModel.Collection
Imports Microsoft.VisualBasic.Imaging
Imports Microsoft.VisualBasic.Imaging.BitmapImage

Public Module ModelLoader

    Public Sub LoadModelFile(filepath As String, CFD As FluidDynamics)
        Dim img As Bitmap = filepath.LoadImage
        Dim rasterModel As Boolean()() = RectangularArray.Matrix(Of Boolean)(CFD.xdim, CFD.ydim)

        If img.Width <> CFD.xdim OrElse img.Height <> CFD.ydim Then
            ' resize image
            img = img.ResizeScaled({CFD.xdim, CFD.ydim})
        End If

        ' transparent is none
        For i As Integer = 0 To CFD.xdim - 1
            For j As Integer = 0 To CFD.ydim - 1
                rasterModel(i)(j) = False 'removes the pre-defined model
                rasterModel(i)(j) = Not img.GetPixel(i, j).IsTransparent
            Next
        Next

        CFD.barrier = rasterModel
    End Sub
End Module
