Imports System.Drawing
Imports CFD.Storage

Public Class Session : Implements IDisposable

    ReadOnly storage As FrameWriter

    ''' <summary>
    ''' the simulation engine
    ''' </summary>
    Friend CFD As FluidDynamics
    Friend dimension As New Size(1280, 720)

    Dim snapshotInterval As Integer = 30
    Dim max_time As Integer = 10 ^ 6
    Dim time As Integer
    Dim pause As Boolean = False
    Dim modelfile As String = Nothing

    Private disposedValue As Boolean

    Public ReadOnly Property IsReady As Boolean
        Get
            Return Not CFD Is Nothing
        End Get
    End Property

    Public ReadOnly Property IsPaused As Boolean
        Get
            Return pause
        End Get
    End Property

    Public ReadOnly Property dimsVal As Size
        Get
            Return dimension
        End Get
    End Property

    Public Sub New(file As FrameWriter)
        storage = file
    End Sub

    Public Function iterations(i As Integer) As Session
        max_time = i
        Return Me
    End Function

    Public Function dims(val As Size) As Session
        dimension = val
        storage.dimension(val)
        Return Me
    End Function

    Public Function interval(f As Integer) As Session
        snapshotInterval = f
        Return Me
    End Function

    Public Function model(filepath As String) As Session
        modelfile = filepath
        Return Me
    End Function

    ''' <summary>
    ''' resume running
    ''' </summary>
    Public Sub [Resume]()
        Call Run(reset:=False)
    End Sub

    ''' <summary>
    ''' pause
    ''' </summary>
    Public Sub [Stop]()
        pause = True
    End Sub

    Dim i As Integer = 1

    ''' <summary>
    ''' start
    ''' </summary>
    ''' <param name="reset"></param>
    Public Sub Run(Optional reset As Boolean = True)
        Dim d As Integer = max_time / 50
        Dim t0 As Date = Now

        If reset Then
            CFD = New FluidDynamics(dimension.Width, dimension.Height)
            CFD.reset()

            Me.i = 0
            Me.time = 0
        End If

        If modelfile.FileExists Then
            Call ModelLoader.LoadModelFile(modelfile, CFD)
            Call CFD.reset()
        End If

        Dim startTime As Integer = Me.time

        For time As Integer = startTime To max_time
            If time Mod snapshotInterval = 0 Then
                ' take snapshot
                Call storage.addFrame(i, NameOf(FluidDynamics.rho), CFD.rho)
                Call storage.addFrame(i, NameOf(FluidDynamics.xvel), CFD.xvel)
                Call storage.addFrame(i, NameOf(FluidDynamics.yvel), CFD.yvel)
                Call storage.addFrame(i, NameOf(FluidDynamics.speed2), CFD.speed2)

                i += 1
            End If

            Call CFD.advance()
            ' Call CFD.CheckNaN()

            If time Mod d = 0 Then
                Call VBDebugger.EchoLine($"[{time}/{max_time}] {(time / max_time * 100).ToString("F1")}% ..... {StringFormats.ReadableElapsedTime((Now - t0).TotalMilliseconds)}")
            End If
            If pause Then
                Exit For
            End If
        Next
    End Sub

    Protected Overridable Sub Dispose(disposing As Boolean)
        If Not disposedValue Then
            If disposing Then
                ' TODO: 释放托管状态(托管对象)
                Call CFD.Dispose()
                Call storage.Dispose()
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
