Imports CFD
Imports Microsoft.VisualBasic.Imaging.Drawing2D.Colors

Public Class CFDHelper : Inherits DataAdapter

    Public Property DrawFrameData As FrameTypes
    Public Property Colors As ScalerPalette
    Public Property ColorLevels As Integer = 255

    Public ReadOnly Property dimension As Size
        Get
            Return New Size(CFD.xdim, CFD.ydim)
        End Get
    End Property

    Public Sub New(CFD As FluidDynamics)
        MyBase.New(CFD)
    End Sub

    Public Sub SetBarrierPoint(xy As Point, r As Integer)
        Dim barrier = GetBarrier()

        For x As Integer = xy.X - r To xy.X + r
            For y As Integer = xy.Y - r To xy.Y + r
                barrier(x)(y) = True
            Next
        Next
    End Sub
End Class

