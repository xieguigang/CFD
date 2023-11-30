Imports System.Drawing
Imports System.IO
Imports Microsoft.VisualBasic.Data.IO
Imports Microsoft.VisualBasic.DataStorage.HDSPack
Imports Microsoft.VisualBasic.DataStorage.HDSPack.FileSystem
Imports Microsoft.VisualBasic.Serialization.JSON
Imports Microsoft.VisualBasic.Text

Namespace Storage

    Public Class FrameWriter : Implements IDisposable

        ReadOnly buf As StreamPack

        ''' <summary>
        ''' total frame count
        ''' </summary>
        Dim total As Integer
        Dim dims As Integer()
        Dim dimensions As New Dictionary(Of String, String)

        Dim disposedValue As Boolean

        Sub New(file As Stream)
            buf = New StreamPack(file)
        End Sub

        Public Sub dimension(val As Size)
            dims = {val.Width, val.Height}
        End Sub

        Public Sub addFrame(time As Integer, dimension As String, framedata As Double()())
            Dim path As String = $"/framedata/{dimension}/{time}.dat"
            Dim file As StreamBuffer = buf.OpenBlock(path)
            Dim wr As New BinaryDataWriter(file) With {
                .ByteOrder = ByteOrder.BigEndian
            }

            For Each row As Double() In framedata
                Call wr.Write(row)
            Next

            total += 1
            dimensions(dimension) = dimension

            Call wr.Flush()
            Call file.Flush()
            Call file.Dispose()
        End Sub

        Private Sub save()
            Dim metadata As New Dictionary(Of String, Object) From {
                {"total", total},
                {"dims", dims},
                {"dimensions", dimensions.Keys.ToArray}
            }
            Dim json As String = metadata.GetJson(knownTypes:={
                GetType(Integer), GetType(Integer()),
                GetType(String), GetType(String())
            })

            Call buf.WriteText(json, fileName:="/metadata.json", Encodings.ASCII)
        End Sub

        Protected Overridable Sub Dispose(disposing As Boolean)
            If Not disposedValue Then
                If disposing Then
                    Call save()
                    Call buf.Dispose()
                End If

                disposedValue = True
            End If
        End Sub

        Public Sub Dispose() Implements IDisposable.Dispose
            Dispose(disposing:=True)
            GC.SuppressFinalize(Me)
        End Sub
    End Class
End Namespace