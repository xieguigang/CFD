Public MustInherit Class Simulation

    ' *************************************************************************
    '                           - DIMENTIONS -         -----                  *
    ' *************************************************************************
    ' number of data points / pixels per dimention
    Public ReadOnly Property xdim As Integer = 1920
    Public ReadOnly Property ydim As Integer = 1080

    Public Overridable Sub setDimentions(width As Integer, height As Integer)
        _xdim = width
        _ydim = height
    End Sub

    ''' <summary>
    ''' *************************************************************************
    ''' METHODS                                                                  *
    ''' **************************************************************************
    ''' </summary>
    Public MustOverride Sub reset()
    Public MustOverride Sub advance()

End Class

Public Class DataReader

    ReadOnly CFD As FluidDynamics

    Sub New(CFD As FluidDynamics)
        Me.CFD = CFD
    End Sub

    Public Function GetSpeed() As Double()()
        Return CFD.speed2
    End Function

End Class