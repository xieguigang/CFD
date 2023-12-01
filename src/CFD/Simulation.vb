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

    ReadOnly CFD As FluidDynamics

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

End Class