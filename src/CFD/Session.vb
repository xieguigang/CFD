Imports System.Drawing
Imports CFD.Storage

Public Class Session

    ReadOnly storage As FrameWriter
    ReadOnly CFD As FluidDynamics

    Dim snapshotInterval As Integer = 30
    Dim max_time As Integer = 10 ^ 6
    Dim dimension As New Size(1280, 720)

    Public Sub New(file As FrameWriter, fluid As FluidDynamics)
        CFD = fluid
        storage = file
    End Sub

    Public Function iterations(i As Integer) As Session
        max_time = i
        Return Me
    End Function

    Public Function dims(val As Size) As Session
        dimension = val
        Return Me
    End Function

    Public Sub Run()
        Call CFD.reset()
        Call CFD.setDimentions(dimension.Width, dimension.Height)

        For time As Integer = 0 To max_time
            If time Mod snapshotInterval = 0 Then
                ' take snapshot

            End If

            Call CFD.advance()
        Next
    End Sub

End Class
