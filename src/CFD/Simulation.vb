Public MustInherit Class Simulation

    ' *************************************************************************
    '                           - DIMENTIONS -         -----                  *
    ' *************************************************************************
    ' number of data points / pixels per dimention
    Public ReadOnly Property xdim As Integer = 1920
    Public ReadOnly Property ydim As Integer = 1080

    Sub New(width As Integer, height As Integer)
        xdim = width
        ydim = height
    End Sub

    ''' <summary>
    ''' *************************************************************************
    ''' METHODS                                                                  *
    ''' **************************************************************************
    ''' </summary>
    Public MustOverride Sub reset()
    Public MustOverride Sub advance()

End Class

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

    Public Function GetDensity() As Double()()
        Return CFD.rho
    End Function

    Public Function GetXVel() As Double()()
        Return CFD.xvel
    End Function

    Public Function GetYVel() As Double()()
        Return CFD.yvel
    End Function

    Public Function GetBarrier() As Boolean()()
        Return CFD.barrier
    End Function

End Class

Public Enum FrameTypes
    Speed
    Density
    XVel
    YVel
End Enum