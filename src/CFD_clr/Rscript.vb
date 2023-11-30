Imports System.IO
Imports CFD
Imports CFD.Storage
Imports Microsoft.VisualBasic.CommandLine.Reflection
Imports Microsoft.VisualBasic.Scripting.MetaData
Imports Microsoft.VisualBasic.Scripting.Runtime
Imports SMRUCC.Rsharp.Runtime
Imports SMRUCC.Rsharp.Runtime.Components
Imports SMRUCC.Rsharp.Runtime.Interop

<Package("CFD")>
Module Rscript

    ''' <summary>
    ''' open the CFD frame data matrix storage
    ''' </summary>
    ''' <param name="file"></param>
    ''' <param name="mode"></param>
    ''' <param name="env"></param>
    ''' <returns></returns>
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

    ''' <summary>
    ''' Create a new CFD session 
    ''' </summary>
    ''' <returns></returns>
    <ExportAPI("session")>
    <RApiReturn(GetType(Session))>
    Public Function create(storage As FrameWriter,
                           <RRawVectorArgument>
                           Optional dims As Object = "1920,1080",
                           Optional interval As Integer = 30,
                           Optional env As Environment = Nothing) As Object

        Dim size = InteropArgumentHelper.getSize(dims, env, [default]:="1920,1080")
        Dim session As New Session(storage, New FluidDynamics)

        Return session.dims(size.SizeParser).interval(interval)
    End Function

    ''' <summary>
    ''' start run the simulation
    ''' </summary>
    ''' <param name="ss"></param>
    ''' <param name="max_time"></param>
    ''' <returns></returns>
    <ExportAPI("start")>
    Public Function start(ss As Session, Optional max_time As Integer = 10 ^ 6) As Session
        Call ss.iterations(max_time).Run()
        Return ss
    End Function

    ''' <summary>
    ''' read a frame data as raster matrix
    ''' </summary>
    ''' <param name="pack"></param>
    ''' <param name="time"></param>
    ''' <returns></returns>
    <ExportAPI("read.frameRaster")>
    Public Function readFrameRaster(pack As FrameReader, time As Integer) As Object
        Dim frame As Double()() = pack.ReadFrame(time)

    End Function
End Module
