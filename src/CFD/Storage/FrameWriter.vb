Imports System.IO
Imports Microsoft.VisualBasic.Data.IO
Imports Microsoft.VisualBasic.DataStorage.HDSPack.FileSystem

Public Class FrameWriter : Implements IDisposable

    ReadOnly buf As StreamPack

    ''' <summary>
    ''' total frame count
    ''' </summary>
    Dim total As Integer
    Dim disposedValue As Boolean

    Sub New(file As Stream)
        buf = New StreamPack(file)
    End Sub

    Public Sub AddFrame(time As Integer, framedata As Double()())
        Dim path As String = $"/frame_data/{time}.dat"
        Dim file As StreamBuffer = buf.OpenBlock(path)
        Dim wr As New BinaryDataWriter(file) With {
            .ByteOrder = ByteOrder.BigEndian
        }

        For Each row As Double() In framedata
            Call wr.Write(row)
        Next

        total += 1

        Call wr.Flush()
        Call file.Flush()
        Call file.Dispose()
    End Sub

    Private Sub save()

    End Sub

    Protected Overridable Sub Dispose(disposing As Boolean)
        If Not disposedValue Then
            If disposing Then
                ' TODO: 释放托管状态(托管对象)
                Call save()
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
