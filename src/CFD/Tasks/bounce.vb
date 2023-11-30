Imports Microsoft.VisualBasic.Parallel

Public Class bounce : Inherits VectorTask

    ReadOnly cfd As CFD_HD

    Sub New(cfd As CFD_HD)
        MyBase.New(nsize:=cfd.xdim)
        Me.cfd = cfd
    End Sub

    Protected Overrides Sub Solve(start As Integer, ends As Integer, cpu_id As Integer)
        For x As Integer = start To ends - 1
            For Y As Integer = 0 To cfd.ydim - 1
                If cfd.barrier(x)(Y) Then
                    If cfd.nN(x)(Y) > 0 Then
                        cfd.nS(x)(Y - 1) += cfd.nN(x)(Y)
                        cfd.nN(x)(Y) = 0
                    End If
                    If cfd.nS(x)(Y) > 0 Then
                        cfd.nN(x)(Y + 1) += cfd.nS(x)(Y)
                        cfd.nS(x)(Y) = 0
                    End If
                    If cfd.nE(x)(Y) > 0 Then
                        cfd.nW(x - 1)(Y) += cfd.nE(x)(Y)
                        cfd.nE(x)(Y) = 0
                    End If
                    If cfd.nW(x)(Y) > 0 Then
                        cfd.nE(x + 1)(Y) += cfd.nW(x)(Y)
                        cfd.nW(x)(Y) = 0
                    End If
                    If cfd.nNW(x)(Y) > 0 Then
                        cfd.nSE(x + 1)(Y - 1) += cfd.nNW(x)(Y)
                        cfd.nNW(x)(Y) = 0
                    End If
                    If cfd.nNE(x)(Y) > 0 Then
                        cfd.nSW(x - 1)(Y - 1) += cfd.nNE(x)(Y)
                        cfd.nNE(x)(Y) = 0
                    End If
                    If cfd.nSW(x)(Y) > 0 Then
                        cfd.nNE(x + 1)(Y + 1) += cfd.nSW(x)(Y)
                        cfd.nSW(x)(Y) = 0
                    End If
                    If cfd.nSE(x)(Y) > 0 Then
                        cfd.nNW(x - 1)(Y + 1) += cfd.nSE(x)(Y)
                        cfd.nSE(x)(Y) = 0
                    End If
                End If
            Next
        Next
    End Sub
End Class
