Imports System.Drawing
Imports Microsoft.VisualBasic.Imaging
Imports Microsoft.VisualBasic.Imaging.BitmapImage

Public Module ModelLoader

    Public Sub LoadModelFile(filepath As String, CFD As FluidDynamics)
        Dim img As Bitmap = filepath.LoadImage

        If img.Width <> CFD.xdim OrElse img.Height <> CFD.ydim Then
            ' resize image
            img = img.ResizeScaled({CFD.xdim, CFD.ydim})
        End If

        ' transparent is none
        For i As Integer = 0 To CFD.xdim - 1
            For j As Integer = 0 To CFD.ydim - 1
                CFD.barrier(i)(j) = False 'removes the pre-defined model
                CFD.barrier(i)(j) = Not img.GetPixel(i, j).IsTransparent
            Next
        Next
    End Sub
End Module
