Imports System.Drawing
Imports System.IO
Imports Microsoft.VisualBasic.ComponentModel.Collection
Imports Microsoft.VisualBasic.ComponentModel.Ranges.Model
Imports Microsoft.VisualBasic.Data.IO
Imports Microsoft.VisualBasic.DataStorage.HDSPack
Imports Microsoft.VisualBasic.DataStorage.HDSPack.FileSystem
Imports Microsoft.VisualBasic.Imaging
Imports Microsoft.VisualBasic.Linq
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
        Dim dimensions As New Dictionary(Of String, DoubleRange)

        Dim disposedValue As Boolean

        Sub New(file As Stream)
            buf = New StreamPack(file, meta_size:=16 * 1024 * 1024)
        End Sub

        Public Sub dimension(val As Size)
            dims = {val.Width, val.Height}
        End Sub

        Public Sub setModelBitmap(model As Bitmap)
            Dim path As String = $"/model.img"
            Dim size As String = $"/model.json"
            Dim pixelSize As Integer = model.MemoryBuffer.GetPixelChannels
            Dim dims As Integer() = New Integer() {model.Width, model.Height, pixelSize}

            Call buf.WriteText(dims.GetJson, fileName:=size, encoding:=Encodings.ASCII)

            Using s As Stream = buf.OpenBlock(path)
                Call s.Write(model.MemoryBuffer.RawBuffer, Scan0, model.MemoryBuffer.Length)
                Call s.Flush()
            End Using
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

            If Not dimensions.ContainsKey(dimension) Then
                dimensions.Add(dimension, New DoubleRange(0, 0))
            End If

            Dim range As DoubleRange = (From row As Double() In framedata Select New DoubleRange(row)) _
                .Select(Function(a) {a.Min, a.Max}) _
                .IteratesALL _
                .Range

            total += 1

            If dimensions(dimension).Min > range.Min Then
                dimensions(dimension).Min = range.Min
            End If
            If dimensions(dimension).Max < range.Max Then
                dimensions(dimension).Max = range.Max
            End If

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
            Dim ranges As Dictionary(Of String, Double()) = dimensions _
                .ToDictionary(Function(d) d.Key,
                              Function(d)
                                  Return New Double() {d.Value.Min, d.Value.Max}
                              End Function)

            Call buf.WriteText(json, fileName:="/metadata.json", Encodings.ASCII)
            Call buf.WriteText(ranges.GetJson, fileName:="/ranges.json", Encodings.ASCII)
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