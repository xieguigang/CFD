Imports System.Drawing
Imports Microsoft.VisualBasic.ApplicationServices
Imports Microsoft.VisualBasic.Imaging
Imports Microsoft.VisualBasic.My.JavaScript

Public MustInherit Class Simulation : Implements requestAnimationFrame

    ' *************************************************************************
    '                           - DIMENTIONS -         -----                  *
    ' *************************************************************************
    ' number of data points / pixels per dimention
    Friend xdim As Integer = 1920
    Friend ydim As Integer = 1080

    Public Overridable Sub setDimentions(width As Integer, height As Integer)
        xdim = width
        ydim = height
    End Sub

    ''' <summary>
    ''' *************************************************************************
    ''' METHODS                                                                  *
    ''' **************************************************************************
    ''' </summary>
    Public MustOverride Sub reset()
    Public MustOverride Sub advance()
    Protected MustOverride Sub draw(g As IGraphics) Implements requestAnimationFrame.requestAnimationFrame

End Class

''' <summary>
''' the simulation viewer
''' </summary>
Public Class AnimationBuilder

    Public Property fs As IFileSystemEnvironment
    Public Property xdim As Integer = 1920
    Public Property ydim As Integer = 1080

    Public Property frameDelay As Integer = 30
    Public Property timeStepsPerFrame As Integer = 1
    Public Property screenshotRate As Integer = 250
    Public Property shouldTakeScreenshots As Boolean = True
    Public Property screenshotName As String = "Screenshot"

    Dim time As Integer = 0
    Dim i As Integer = 0

    Sub Run(source As Simulation)
        Call source.reset()
        Call source.setDimentions(xdim, ydim)

        Do While True
            If time Mod screenshotRate = 0 AndAlso shouldTakeScreenshots Then
                Dim g As Graphics2D = Graphics2D.CreateDevice(New Size(xdim, ydim))
                Dim st As String = "" & i.ToString().PadLeft(5, "0"c)
                Dim filepath = fs.OpenFile("video/" & screenshotName & "-T" & st & ".png",, IO.FileAccess.Write)
                Call DirectCast(source, requestAnimationFrame).requestAnimationFrame(g)
                Call g.Flush()
                Call g.ImageResource.Save(filepath, ImageFormats.Png.GetFormat)
                Call filepath.Flush()
                Call filepath.Dispose()
                i += 1
            End If
            source.advance()
            time += 1
        Loop
    End Sub

End Class