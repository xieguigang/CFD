Imports System.Drawing

Public MustInherit Class Simulation : Implements IDisposable

    Private disposedValue As Boolean

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

    Protected MustOverride Sub close()

    Protected Overridable Sub Dispose(disposing As Boolean)
        If Not disposedValue Then
            If disposing Then
                ' TODO: 释放托管状态(托管对象)
                Call close()
            End If

            ' TODO: 释放未托管的资源(未托管的对象)并重写终结器
            ' TODO: 将大型字段设置为 null
            disposedValue = True
        End If
    End Sub

    ' ' TODO: 仅当“Dispose(disposing As Boolean)”拥有用于释放未托管资源的代码时才替代终结器
    ' Protected Overrides Sub Finalize()
    '     ' 不要更改此代码。请将清理代码放入“Dispose(disposing As Boolean)”方法中
    '     Dispose(disposing:=False)
    '     MyBase.Finalize()
    ' End Sub

    Public Sub Dispose() Implements IDisposable.Dispose
        ' 不要更改此代码。请将清理代码放入“Dispose(disposing As Boolean)”方法中
        Dispose(disposing:=True)
        GC.SuppressFinalize(Me)
    End Sub
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