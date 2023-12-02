Imports System.Runtime.CompilerServices
Imports Microsoft.VisualBasic.Imaging
Imports Microsoft.VisualBasic.Imaging.Drawing2D.HeatMap

Public Class RawRaster : Implements IRasterGrayscaleHeatmap

    Public raster As PixelData()

    <MethodImpl(MethodImplOptions.AggressiveInlining)>
    Public Function GetRasterPixels() As IEnumerable(Of Pixel) Implements IRasterGrayscaleHeatmap.GetRasterPixels
        Return raster.Select(Function(i) DirectCast(i, Pixel))
    End Function
End Class
