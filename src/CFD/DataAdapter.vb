Imports System.Drawing

Public Class DataAdapter

    Protected ReadOnly CFD As FluidDynamics

    Public Property velocity As Double
        Get
            Return CFD.velocity
        End Get
        Set(value As Double)
            CFD.velocity = value
        End Set
    End Property

    Public Property viscocity As Double
        Get
            Return CFD.viscocity
        End Get
        Set(value As Double)
            CFD.viscocity = value
        End Set
    End Property

    Sub New(CFD As FluidDynamics)
        Me.CFD = CFD
    End Sub

    Public Function GetSpeed() As Double()()
        Return CFD.speed2
    End Function

    Public Function GetSpeed(xy As Point) As Double
        Return CFD.speed2(xy.X)(xy.Y)
    End Function

    Public Function GetDensity() As Double()()
        Return CFD.rho
    End Function

    Public Function GetDensity(xy As Point) As Double
        Return CFD.rho(xy.X)(xy.Y)
    End Function

    Public Function GetXVel() As Double()()
        Return CFD.xvel
    End Function

    Public Function GetXVel(xy As Point) As Double
        Return CFD.xvel(xy.X)(xy.Y)
    End Function

    Public Function GetYVel() As Double()()
        Return CFD.yvel
    End Function

    Public Function GetYVel(xy As Point) As Double
        Return CFD.yvel(xy.X)(xy.Y)
    End Function

    Public Function GetBarrier() As Boolean()()
        Return CFD.barrier
    End Function

    Public Function GetBarrier(xy As Point) As Boolean
        Return CFD.barrier(xy.X)(xy.Y)
    End Function

End Class

Public Enum FrameTypes
    Speed
    Density
    XVel
    YVel
End Enum