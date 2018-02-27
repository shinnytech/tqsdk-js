.. _trade:

交易程序
==========

介绍
----------------------------------------------------------------------

:emphasis:`emphasis` – 代替 ``*emphasis*``

:strong:`strong` – 代替 ``**strong**``

:literal:`literal` – 代替 ``literal``

:subscript:`下标文本` – 下标文本

:superscript:`上标文本` – 上标文本

:title-reference:`圆桌派` – 书，期刊，以及其他材料的标题

列表
----------------------------------------------------------------------

* This is a bulleted list.
* It has two items, the second
  item uses two lines.

1. This is a numbered list.
2. It has two items too.

#. This is a numbered list. 自动编号通过使用标志 #
#. It has two items too.

嵌套列表
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

* this is
* a list

    * with a nested list
    * and some subitems

        * with a nested list
        * and some subitems

* and here the parent list continues

定义列表
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

term (up to a line of text)
   Definition of the term, which must be indented

   and can even consist of multiple paragraphs

next term - term 不能有一个以上的文本行
   Description.

| These lines are
| broken exactly like in
| the source file.

field lists
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

:Date: 2001-08-16
:Version: 1
:Authors: - Me
          - Myself
          - I
:Indentation: Since the field marker may be quite long, the second
   and subsequent lines of the field body do not have to line up
   with the first line, but they must be indented relative to the
   field name marker, and they must line up with each other.
:Parameter i: integer

option lists
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-a         Output all.
-b         Output both (this description is
           quite long).
-c arg     Output just arg.
--long     Output all day long.

-p         This option has two paragraphs in the description.
           This is the first.

           This is the second.  Blank lines may be omitted between
           options (as above) or left in (as here and below).

--very-long-option  A VMS-style option.  Note the adjustment for
                    the required two spaces.

--an-even-longer-option
           The description can also start on the next line.

-2, --two  This option has two variants.

-f FILE, --file=FILE  These two options are synonyms; both have
                      arguments.

/V         A VMS/DOS-style option.

quoted literal blocks
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

John Doe wrote::

>> Great idea!
>
> Why didn't I think of that?

You just did!  ;-)

doctest blocks
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

This is an ordinary paragraph.

>>> print 'this is a Doctest block'
this is a Doctest block

The following is a literal block::

    >>> This is not recognized as a doctest block by
    reStructuredText.  It *will* be recognized by the doctest
    module, though!


源代码
----------------------------------------------------------------------

This is a normal text paragraph. The next paragraph is a code sample::

   It is not processed in any way, except
   that the indentation is removed.

   It can span multiple lines.

This is a normal text paragraph again.

``::`` 标记的处理非常聪明:

+ 如果出现在段落本身中，那么整个段落将会从文档中删除（也就是说不会出现在生成的文档中）。
+ 如果它前面的空白，标记将被删除。
+ 如果它的前面非空白，标记会被单个冒号取代。

在这一章中通过一个完整的示例，了解如何使用 javascript 编写你想要交易程序。

表格
----------------------------------------------------------------------

+------------------------+------------+----------+----------+
| Header row, column 1   | Header 2   | Header 3 | Header 4 |
| (header rows optional) |            |          |          |
+========================+============+==========+==========+
| body row 1, column 1   | column 2   | column 3 | column 4 |
+------------------------+------------+----------+----------+
| body row 2             | ...        | ...      |          |
+------------------------+------------+----------+----------+

=====  =====  =======
A      B      A and B
=====  =====  =======
False  False  False
True   False  False
False  True   False
True   True   True
=====  =====  =======

简单表格更容易书写，但是有限制：表格必须是两行以及以上，而且第一列不能包含多行。


超链接
----------------------------------------------------------------------

`Link text <http://example.com/>`_

Chrome 浏览器， `Chrome 浏览器下载地址`_ 。

:ref:`2_1_new`

指令（标识符）
----------------------------------------------------------------------

.. danger::
   Beware killer rabbits! -- danger

.. error::
   Beware killer rabbits! -- error

.. warning::
   Beware killer rabbits! -- warning

.. caution::
   Beware killer rabbits! -- caution

.. attention::
   Beware killer rabbits! -- attention

.. important::
   Beware killer rabbits! -- important

.. note:: This is a note admonition.
   This is the second line of the first paragraph. -- note

   - The note contains all indented body elements
     following.
   - It includes this bullet list.

.. hint::
   Beware killer rabbits! -- hint

.. tip::
   Beware killer rabbits! -- tip

.. contents:: :depth: 2 

当前文档目录

.. topic:: Topic Title

    Subsequent indented lines comprise
    the body of the topic, and are
    interpreted as body elements.

.. list-table:: Frozen Delights!
   :widths: 15 10 30
   :header-rows: 1

   * - Treat
     - Quantity
     - Description
   * - Albatross
     - 2.99
     - On a stick!
   * - Crunchy Frog
     - 1.49
     - If we took the bones out, it wouldn't be
       crunchy, now would it?
   * - Gannet Ripple
     - 1.99
     - On a stick!

.. image:: gnu.png
   (options)
   
注脚
----------------------------------------------------------------------

Lorem ipsum [#f1]_ dolor sit amet ... [#f2]_

引文
----------------------------------------------------------------------

Lorem ipsum [Ref]_ dolor sit amet.


注释
----------------------------------------------------------------------

.. This is a comment.

您可以缩进文本在注释开始后，这样可以形成多行注释:

..
   This whole indented block
   is a comment.

   Still in the comment.


Math support
----------------------------------------------------------------------

Since Pythagoras, we know that :math:`a^2 + b^2 = c^2`.

.. math::

   (a + b)^2  &=  (a + b)(a + b) \\
              &=  a^2 + 2ab + b^2

.. math::
   :nowrap:

   \begin{eqnarray}
      y    & = & ax^2 + bx + c \\
      f(x) & = & x^2 + 2xy + y^2
   \end{eqnarray}

.. math:: 
    e^{i\pi} + 1 = 0
    :label: euler

Euler's identity, equation :eq:`euler`, was elected one of the most
beautiful mathematical formulas.


3. 子目录
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. toctree::
    :maxdepth: 1

    more_example/3_1_spread.rst
    more_example/3_2_split.rst
    more_example/3_3_combine.rst


.. [Ref] www.baidu.com Book or article reference, URL or whatever. 


.. _天勤客户端下载地址: http://tq18.cn/
.. _Chrome 浏览器下载地址: https://www.google.com/chrome/browser/desktop/index.html

.. rubric:: 注脚

.. [#f1] Text of the first footnote.
.. [#f2] Text of the second footnote.