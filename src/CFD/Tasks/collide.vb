Imports Microsoft.VisualBasic.Parallel

Namespace Tasks

    Public Class collide : Inherits VectorTask

        ReadOnly cfd As FluidDynamics

        Public Sub New(cfd As FluidDynamics)
            MyBase.New(nsize:=cfd.xdim)
            Me.cfd = cfd
        End Sub

        Protected Overrides Sub Solve(start As Integer, ends As Integer, cpu_id As Integer)
            Dim this_rho, one9thn, one36thn, vx, vy, vx2, vy2, vx3, vy3, vxvy2, v2, v215 As Double
            Dim omega = 1 / (3 * cfd.viscocity + 0.5) ' reciprocal of tau, the relaxation time

            For x As Integer = start To ends
                For y As Integer = 0 To cfd.ydim - 1
                    If Not cfd.barrier(x)(y) Then
                        this_rho = cfd.n0(x)(y) + cfd.nN(x)(y) + cfd.nS(x)(y) + cfd.nE(x)(y) +
                            cfd.nW(x)(y) + cfd.nNW(x)(y) + cfd.nNE(x)(y) + cfd.nSW(x)(y) + cfd.nSE(x)(y)

                        If this_rho > 1 Then
                            this_rho = 1
                        ElseIf this_rho < -1 Then
                            this_rho = -1
                        End If

                        ' macroscopic density may be needed for plotting
                        cfd.rho(x)(y) = this_rho

                        one9thn = one9th * this_rho
                        one36thn = one36th * this_rho

                        If this_rho > 0 Then
                            vx = (cfd.nE(x)(y) + cfd.nNE(x)(y) + cfd.nSE(x)(y) - cfd.nW(x)(y) - cfd.nNW(x)(y) - cfd.nSW(x)(y)) / this_rho
                        Else
                            vx = 0
                        End If
                        cfd.xvel(x)(y) = vx ' may be needed for plotting
                        If this_rho > 0 Then
                            vy = (cfd.nN(x)(y) + cfd.nNE(x)(y) + cfd.nNW(x)(y) - cfd.nS(x)(y) - cfd.nSE(x)(y) - cfd.nSW(x)(y)) / this_rho
                        Else
                            vy = 0
                        End If
                        cfd.yvel(x)(y) = vy ' may be needed for plotting
                        vx3 = 3 * vx
                        vy3 = 3 * vy
                        vx2 = vx * vx
                        vy2 = vy * vy
                        vxvy2 = 2 * vx * vy
                        v2 = vx2 + vy2
                        cfd.speed2(x)(y) = v2 ' may be needed for plotting
                        v215 = 1.5 * v2
                        cfd.n0(x)(y) += omega * (four9ths * this_rho * (1 - v215) - cfd.n0(x)(y))
                        cfd.nE(x)(y) += omega * (one9thn * (1 + vx3 + 4.5 * vx2 - v215) - cfd.nE(x)(y))
                        cfd.nW(x)(y) += omega * (one9thn * (1 - vx3 + 4.5 * vx2 - v215) - cfd.nW(x)(y))
                        cfd.nN(x)(y) += omega * (one9thn * (1 + vy3 + 4.5 * vy2 - v215) - cfd.nN(x)(y))
                        cfd.nS(x)(y) += omega * (one9thn * (1 - vy3 + 4.5 * vy2 - v215) - cfd.nS(x)(y))
                        cfd.nNE(x)(y) += omega * (one36thn * (1 + vx3 + vy3 + 4.5 * (v2 + vxvy2) - v215) - cfd.nNE(x)(y))
                        cfd.nNW(x)(y) += omega * (one36thn * (1 - vx3 + vy3 + 4.5 * (v2 - vxvy2) - v215) - cfd.nNW(x)(y))
                        cfd.nSE(x)(y) += omega * (one36thn * (1 + vx3 - vy3 + 4.5 * (v2 - vxvy2) - v215) - cfd.nSE(x)(y))
                        cfd.nSW(x)(y) += omega * (one36thn * (1 - vx3 - vy3 + 4.5 * (v2 + vxvy2) - v215) - cfd.nSW(x)(y))
                    End If
                Next
            Next
        End Sub
    End Class
End Namespace