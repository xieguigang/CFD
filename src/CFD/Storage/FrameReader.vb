Imports System.Drawing
Imports System.IO
Imports Microsoft.VisualBasic.ComponentModel.Collection
Imports Microsoft.VisualBasic.Data.IO
Imports Microsoft.VisualBasic.DataStorage.HDSPack.FileSystem

Namespace Storage

    Public Class FrameReader : Implements IDisposable

        ReadOnly buf As StreamPack
        ReadOnly dims As Size

        Private disposedValue As Boolean

        Sub New(file As Stream)
            buf = New StreamPack(file, [readonly]:=True)
        End Sub

        Public Function ReadFrame(i As Integer) As Double()()
            Dim path As String = $"/frame_data/{i}.dat"
            Dim file As Stream = buf.OpenFile(path, FileMode.Open, FileAccess.Read)
            Dim rd As New BinaryDataReader(file) With {
                .ByteOrder = ByteOrder.BigEndian
            }
            Dim framedata As Double()() = RectangularArray.Matrix(Of Double)(dims.Width, dims.Height)

            For offset As Integer = 0 To framedata.Length - 1
                framedata(offset) = rd.ReadDoubles(count:=dims.Height)
            Next

            Return framedata
        End Function

        Protected Overridable Sub Dispose(disposing As Boolean)
            If Not disposedValue Then
                If disposing Then
                    ' TODO: 释放托管状态(托管对象)
                    Call buf.Dispose()
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
End Namespace