Imports System.IO
Imports Microsoft.VisualBasic.Data.IO
Imports Microsoft.VisualBasic.DataStorage.HDSPack.FileSystem

Namespace Storage

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
                    ' TODO: �ͷ��й�״̬(�йܶ���)
                    Call save()
                    Call buf.Dispose()
                End If

                ' TODO: �ͷ�δ�йܵ���Դ(δ�йܵĶ���)����д�ս���
                ' TODO: �������ֶ�����Ϊ null
                disposedValue = True
            End If
        End Sub

        ' ' TODO: ������Dispose(disposing As Boolean)��ӵ�������ͷ�δ�й���Դ�Ĵ���ʱ������ս���
        ' Protected Overrides Sub Finalize()
        '     ' ��Ҫ���Ĵ˴��롣�뽫���������롰Dispose(disposing As Boolean)��������
        '     Dispose(disposing:=False)
        '     MyBase.Finalize()
        ' End Sub

        Public Sub Dispose() Implements IDisposable.Dispose
            ' ��Ҫ���Ĵ˴��롣�뽫���������롰Dispose(disposing As Boolean)��������
            Dispose(disposing:=True)
            GC.SuppressFinalize(Me)
        End Sub
    End Class
End Namespace