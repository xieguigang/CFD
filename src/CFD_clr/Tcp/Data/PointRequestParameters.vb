Imports System.Drawing
Imports CFD

Public Class PointRequestParameters

    Public Property x As Integer
    Public Property y As Integer
    Public Property frame As FrameTypes

    Public Function GetPoint() As Point
        Return New Point(x, y)
    End Function
End Class
