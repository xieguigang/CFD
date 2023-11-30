Imports System.IO
Imports CFD
Imports Microsoft.VisualBasic.CommandLine.Reflection
Imports Microsoft.VisualBasic.Scripting.MetaData
Imports SMRUCC.Rsharp.Runtime
Imports SMRUCC.Rsharp.Runtime.Components
Imports SMRUCC.Rsharp.Runtime.Interop

<Package("CFD")>
Module Rscript

    <ExportAPI("open.pack")>
    <RApiReturn(GetType(FrameWriter), GetType(FrameReader))>
    Public Function open(<RRawVectorArgument>
                         file As Object,
                         Optional mode As FileAccess = FileAccess.Read,
                         Optional env As Environment = Nothing) As Object

        Dim buf = SMRUCC.Rsharp.GetFileStream(file, mode, env)

        If buf Like GetType(Message) Then
            Return buf.TryCast(Of Message)
        End If

        If mode = FileAccess.Read Then
            Return New FrameReader(buf.TryCast(Of Stream))
        Else
            Return New FrameWriter(buf.TryCast(Of Stream))
        End If
    End Function
End Module
