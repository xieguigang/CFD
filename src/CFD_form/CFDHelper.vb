Imports CFD
Imports Microsoft.VisualBasic.Imaging.Drawing2D.Colors

Public Class CFDHelper : Inherits DataAdapter

    Public Property DrawFrameData As FrameTypes
    Public Property Colors As ScalerPalette = ScalerPalette.FlexImaging
    Public Property ColorLevels As Integer = 255

    Public Property TracerSpeedLevel As Double = 25
    Public Property RefreshRate As Integer
        Get
            Return 1000 / timer.Interval
        End Get
        Set(value As Integer)
            timer.Interval = 1000 / value
        End Set
    End Property

    Public ReadOnly Property dimension As Size
        Get
            Return New Size(CFD.xdim, CFD.ydim)
        End Get
    End Property

    Dim timer As Timer

    Public Sub New(CFD As FluidDynamics, timer As Timer)
        MyBase.New(CFD)
        Me.timer = timer
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

