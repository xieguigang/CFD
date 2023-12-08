Imports System.Runtime.CompilerServices

Module DebugHelper

    <Extension>
    Private Sub CheckNaN(m As Double()())
        If m.Any(Function(r) r.Any(Function(mi) mi.IsNaNImaginary)) Then
            Throw New InvalidProgramException
        End If
    End Sub

    <Extension>
    Public Function CheckNaN(CFD As FluidDynamics) As Boolean
        Call CFD.n0.CheckNaN
        Call CFD.nE.CheckNaN
        Call CFD.nN.CheckNaN
        Call CFD.nNE.CheckNaN
        Call CFD.nNW.CheckNaN
        Call CFD.nS.CheckNaN
        Call CFD.nSE.CheckNaN
        Call CFD.nSW.CheckNaN
        Call CFD.nW.CheckNaN
        Call CFD.rho.CheckNaN
        Call CFD.speed2.CheckNaN
        Call CFD.xvel.CheckNaN
        Call CFD.yvel.CheckNaN

        Return True
    End Function
End Module
